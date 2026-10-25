"use client";

import { useEffect, useRef, useState } from "react";
import { Submit } from "../submit";
import { btn, btnPrimary, input } from "../ui";

const SIDE = 1200; // photos are shown square, so they are stored square

/** Centre-crops to a square and shrinks it. Phone photos are 5–10 MB; this comes out around 150 KB. */
async function prepare(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(side, SIDE);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.82));
  // Some browsers cannot write WebP and quietly hand back a PNG; JPEG is smaller for photos.
  const out = blob && blob.type === "image/webp" ? blob : await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
  if (!out) throw new Error("no blob");
  return new File([out], out.type === "image/webp" ? "photo.webp" : "photo.jpg", { type: out.type });
}

type Props = {
  action: (form: FormData) => void | Promise<void>;
  dish: string;
  current?: { src: string; alt: string; sample?: boolean };
  alt?: string;
};

export function PhotoUpload({ action, dish, current, alt }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function chosen(file: File | undefined) {
    setProblem(null);
    if (!file) return;
    setBusy(true);
    try {
      const ready = await prepare(file);
      const list = new DataTransfer();
      list.items.add(ready);
      if (hidden.current) hidden.current.files = list.files;
      setPreview(URL.createObjectURL(ready));
    } catch {
      setPreview(null);
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
            <img src={shown} alt={preview ? `New photo of ${dish}` : current?.alt ?? ""} className="h-full w-full object-cover" />
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
          <p className="text-xs text-espresso/75">On a phone this opens the camera or your photo library. It is cropped square and shrunk for you.</p>
        </div>
      </div>

      <input ref={hidden} type="file" name="photo" className="hidden" tabIndex={-1} aria-hidden />

      {preview && (
        <>
          <label className="block text-sm text-espresso/80">
            What does it show? (optional, read aloud for blind visitors)
            <input name="alt" defaultValue={alt ?? ""} maxLength={160} placeholder={`${dish}, on a white plate`} className={input} />
          </label>
          <Submit busy="Uploading…" className={btnPrimary}>Save photo</Submit>
        </>
      )}
      {problem && <p role="alert" className="text-sm text-wine">{problem}</p>}
    </form>
  );
}
