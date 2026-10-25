"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Submit } from "../submit";
import { btn, btnPrimary, input } from "../ui";

const SIDE = 1200; // dish photos are shown square, so they are stored square
const LONG = 1600; // gallery photos keep their shape; the long side is shrunk to this

type Ready = { file: File; width: number; height: number };

/** Dishes: centre-crops to a square and shrinks it. Gallery ("fit"): keeps the shape and shrinks it.
 *  Phone photos are 5–10 MB; either way this comes out around 150–300 KB. */
async function prepare(file: File, fit: boolean): Promise<Ready> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  if (fit) {
    const k = Math.min(1, LONG / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * k));
    canvas.height = Math.max(1, Math.round(bitmap.height * k));
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  } else {
    const side = Math.min(bitmap.width, bitmap.height);
    const size = Math.min(side, SIDE);
    canvas.width = canvas.height = size;
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  }
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.82));
  // Some browsers cannot write WebP and quietly hand back a PNG; JPEG is smaller for photos.
  const out = blob && blob.type === "image/webp" ? blob : await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
  if (!out) throw new Error("no blob");
  return { file: new File([out], out.type === "image/webp" ? "photo.webp" : "photo.jpg", { type: out.type }), width: canvas.width, height: canvas.height };
}

type Props = {
  action: (form: FormData) => void | Promise<void>;
  dish: string;
  current?: { src: string; alt: string; sample?: boolean };
  alt?: string;
  /** gallery mode: keep the photo's shape, and ask for a caption too */
  fit?: boolean;
  submitLabel?: string;
  /** extra fields shown with the caption (the gallery's chapter picker) */
  extra?: ReactNode;
};

export function PhotoUpload({ action, dish, current, alt, fit = false, submitLabel = "Save photo", extra }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function chosen(file: File | undefined) {
    setProblem(null);
    if (!file) return;
    setBusy(true);
    try {
      const ready = await prepare(file, fit);
      const list = new DataTransfer();
      list.items.add(ready.file);
      if (hidden.current) hidden.current.files = list.files;
      setSize({ width: ready.width, height: ready.height });
      setPreview(URL.createObjectURL(ready.file));
    } catch {
      setPreview(null);
      setSize(null);
      if (hidden.current) hidden.current.value = "";
      setProblem("That photo could not be read. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
    }
  }

  const shown = preview ?? current?.src;

  return (
    <form action={action} className="space-y-3">
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-espresso/15 bg-espresso/5">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local preview or the live file, shown small in the admin
            <img src={shown} alt={preview ? `New photo of ${dish}` : current?.alt ?? ""} className={`h-full w-full ${fit ? "object-contain" : "object-cover"}`} />
          ) : (
            <span className="grid h-full place-items-center px-2 text-center text-xs text-espresso/70">No photo yet</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input ref={picker} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-label={`Photo file for ${dish}`} onChange={(e) => chosen(e.target.files?.[0])} />
          <button type="button" onClick={() => picker.current?.click()} className={btn} disabled={busy}>
            {busy ? "Preparing…" : shown ? "Choose another photo" : "Choose a photo"}
          </button>
          {current?.sample && !preview && <p className="text-xs font-medium text-espresso/80">This is a demo sample photo. Upload your own to replace it.</p>}
          <p className="text-xs text-espresso/75">On a phone this opens the camera or your photo library. {fit ? "It keeps its shape and is shrunk for you." : "It is cropped square and shrunk for you."}</p>
        </div>
      </div>

      <input ref={hidden} type="file" name="photo" className="hidden" tabIndex={-1} aria-hidden />
      {fit && size && (
        <>
          <input type="hidden" name="width" value={size.width} />
          <input type="hidden" name="height" value={size.height} />
        </>
      )}

      {preview && (
        <>
          {fit && (
            <label className="block text-sm text-espresso/80">
              Caption (the handwritten line under the photo, up to 80 characters)
              <input name="caption" required maxLength={80} placeholder="The long table, set for Sunday." className={input} />
            </label>
          )}
          {extra}
          <label className="block text-sm text-espresso/80">
            What does it show? (optional, read aloud for blind visitors)
            <textarea name="alt" defaultValue={alt ?? ""} rows={5} maxLength={300} placeholder={fit ? "A long wooden table set with plates and candles" : `${dish}, on a white plate`} className={`${input} field-sizing-content min-h-32`} />
          </label>
          <Submit busy="Uploading…" className={btnPrimary}>{submitLabel}</Submit>
        </>
      )}
      {problem && <p role="alert" className="text-sm text-wine">{problem}</p>}
    </form>
  );
}
