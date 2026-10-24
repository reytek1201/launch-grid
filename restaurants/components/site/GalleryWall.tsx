"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Photo } from "@/lib/types";
import { RusticCard } from "./RusticCard";

const tilt = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1", "rotate-[1.5deg]", "-rotate-[1.5deg]"];

export function GalleryWall({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = (dir: number) => setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length));
  const current = open === null ? null : photos[open];

  return (
    <>
      <ul className="columns-1 gap-8 sm:columns-2 lg:columns-3">
        {photos.map((p, n) => (
          <li key={p.id} className="mb-8 break-inside-avoid">
            <Reveal><button
              type="button"
              onClick={(e) => { opener.current = e.currentTarget; setOpen(n); }}
              className={`block w-full transition duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-1.5 hover:rotate-0 focus-visible:-translate-y-1.5 focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta-deep ${tilt[n % tilt.length]}`}
              aria-label={`Enlarge photo: ${p.alt}`}
            >
              <RusticCard tape={n % 3 !== 1} pad="p-3 pb-10">
                <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="paper-photo h-auto w-full" />
              </RusticCard>
            </button></Reveal>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        onClose={() => { setOpen(null); opener.current?.focus(); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        className="m-auto w-[min(96vw,1100px)] bg-transparent p-0 backdrop:bg-espresso/90"
      >
        {current && (
          <figure className="relative text-cream">
            <Image src={current.src} alt={current.alt} width={current.width} height={current.height} sizes="96vw" className="mx-auto max-h-[80vh] w-auto" />
            <figcaption className="mt-3 text-center text-sm">{current.alt}</figcaption>
            <div className="mt-3 flex justify-center gap-3">
              <button type="button" onClick={() => step(-1)} className="rounded-full border border-cream/60 px-4 py-2">Previous</button>
              <button type="button" onClick={() => step(1)} className="rounded-full border border-cream/60 px-4 py-2">Next</button>
              <button type="button" autoFocus onClick={() => setOpen(null)} className="rounded-full bg-cream px-4 py-2 text-espresso">Close</button>
            </div>
          </figure>
        )}
      </dialog>
    </>
  );
}
