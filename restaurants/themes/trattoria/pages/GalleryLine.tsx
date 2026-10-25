"use client";

import { AnimatePresence, type MotionValue, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, useVelocity } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DESKTOP, useMedia } from "@/components/motion/useMedia";
import { RusticCard } from "@/components/site/RusticCard";
import type { Photo } from "@/lib/types";
import { useScene } from "../signature/useScene";

export type LinePhoto = Photo & { caption: string };
export type LineChapter = { id: string; title: string; line: string; photos: LinePhoto[] };

const TILT = [-2.5, 1.8, -1.2, 2.4, -2, 1.2, -0.8];
const EASE = [0.2, 0.7, 0.2, 1] as const;
const SEGMENT = 760; // twine sags between lanterns this far apart

const wide = (p: Photo) => p.width / p.height > 1.15;

function Hanging({ p, i, swing, onOpen, phone }: { p: LinePhoto; i: number; swing?: MotionValue<number>; onOpen: (el: HTMLElement) => void; phone?: boolean }) {
  const still = useMotionValue(0);
  const rotate = useTransform(swing ?? still, (v) => TILT[i % TILT.length] + v * (0.6 + (i % 3) * 0.25));
  const taped = i % 5 === 3; // a few are taped up instead of pegged, so the line looks hung by hand
  const size = phone ? (wide(p) ? "w-[78vw] max-w-[22rem]" : "w-[58vw] max-w-[15rem]") : wide(p) ? "w-[min(30rem,52svh)]" : "w-[min(19rem,35svh)]";
  return (
    <motion.li className={`relative shrink-0 origin-top snap-center pt-5 ${size}`} style={{ rotate }}>
      {!taped && <span aria-hidden className="peg absolute left-1/2 top-0 z-10 h-9 w-2.5 -translate-x-1/2 rounded-[3px]" />}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`Open photo: ${p.caption}`}
        onClick={(e) => onOpen(e.currentTarget)}
        className="group block w-full cursor-zoom-in text-left"
      >
        <RusticCard tape={taped} pad="p-2.5 pb-3" className="transition-transform duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5">
          <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes={phone ? "78vw" : wide(p) ? "480px" : "304px"} quality={75} className="paper-photo h-auto w-full" draggable={false} />
          <p className="mt-2 px-1 font-hand text-xl leading-tight text-espresso/80">{p.caption}</p>
        </RusticCard>
      </button>
    </motion.li>
  );
}

function Tag({ title, line, id }: { title: string; line: string; id: string }) {
  return (
    <div className="relative shrink-0 pt-9">
      <span aria-hidden className="absolute left-[30%] top-0 h-10 w-px origin-top rotate-[14deg] bg-[#8a6a44]" />
      <span aria-hidden className="absolute right-[30%] top-0 h-10 w-px origin-top -rotate-[14deg] bg-[#8a6a44]" />
      <div className="w-48 rounded-md border-2 border-[#3a2416] px-4 py-3 text-center shadow-[0_10px_18px_rgb(20_12_8/0.4)]" style={{ background: "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.04) 0 2px, transparent 2px 18px), linear-gradient(180deg, #6b4428, #4a2e1b)" }}>
        <h2 id={id} className="font-hand text-4xl leading-none text-[#f2b27a]">{title}</h2>
        <p className="mt-1 text-sm leading-snug text-cream/90">{line}</p>
      </div>
    </div>
  );
}

const twine = (w: number) => {
  let d = "M0 10";
  for (let x = 0; x < w; x += SEGMENT) d += ` Q ${x + SEGMENT / 2} 30 ${x + SEGMENT} 10`;
  return d;
};

/*
 * The gallery as a clothesline across the room. Desktop: the section holds and scrolling walks
 * you sideways along the twine; photos sway with the speed of the scroll, the wall drifts slower.
 * Phones and reduced motion: one swipeable line per chapter, nothing pinned.
 * Any photo opens in a viewer (arrows, keys, swipe), and focus returns to it on close.
 */
export function GalleryLine({ chapters, wall }: { chapters: LineChapter[]; wall: string }) {
  const desktop = useMedia(DESKTOP);
  const { ref, progress, reduce } = useScene(0);
  const sideways = desktop && !reduce;

  const all = chapters.flatMap((c) => c.photos.map((p) => ({ ...p, chapter: c.title })));
  const index = (id: string) => all.findIndex((p) => p.id === id);

  // Measure the line so the scroll distance matches it exactly.
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [lineW, setLineW] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);
  useEffect(() => {
    const el = track.current;
    if (!el || !sideways) return;
    const ro = new ResizeObserver(() => {
      setLineW(el.scrollWidth);
      const d = Math.max(0, el.scrollWidth - window.innerWidth);
      setDist(d);
      setMarks(chapters.map((c) => {
        const tag = el.querySelector<HTMLElement>(`[data-chapter="${c.id}"]`);
        return d ? Math.min(1, Math.max(0, ((tag?.offsetLeft ?? 0) - window.innerWidth * 0.12) / d)) : 0;
      }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [sideways, chapters]);

  const x = useTransform(progress, (p) => -Math.min(1, Math.max(0, (p - 0.02) / 0.96)) * dist);
  const wallX = useTransform(progress, [0, 1], ["0%", "-18%"]);
  const velocity = useVelocity(progress);
  const swing = useSpring(useTransform(velocity, (v) => Math.max(-8, Math.min(8, -v * 55))), { stiffness: 90, damping: 7 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    let a = 0;
    marks.forEach((m, k) => { if (p >= m - 0.01) a = k; });
    setActive(a);
  });
  const goTo = (k: number) => {
    const s = ref.current;
    if (!s) return;
    const top = s.getBoundingClientRect().top + window.scrollY;
    const travel = s.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * (0.02 + (marks[k] ?? 0) * 0.96) + 2, behavior: reduce ? "auto" : "smooth" });
  };

  // Viewer
  const [open, setOpen] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);
  const openAt = (id: string) => (el: HTMLElement) => { opener.current = el; setOpen(index(id)); };
  const step = (n: number) => { setDir(n); setOpen((i) => (i === null ? i : (i + n + all.length) % all.length)); };
  const cur = open === null ? null : all[open];

  let n = 0;
  return (
    <>
      {sideways ? (
        <section ref={ref} aria-label="Photos along the line" className="relative" style={{ height: `calc(100svh + ${dist}px)` }}>
          <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
            <motion.div aria-hidden className="absolute inset-y-0 left-0 w-[140%]" style={{ x: wallX, backgroundImage: wall }} />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(255_220_160/0.35),transparent_60%),linear-gradient(180deg,rgb(40_24_14/0.25),transparent_30%,rgb(40_24_14/0.35))]" />

            <motion.div ref={track} className="relative w-max pl-[10vw] pr-[12vw] pt-6" style={{ x }}>
              {/* Twine and lanterns */}
              {lineW > 0 && (
                <svg aria-hidden className="pointer-events-none absolute left-0 top-6 h-10" width={lineW} viewBox={`0 0 ${lineW} 40`} fill="none">
                  <path d={twine(lineW)} stroke="#7a5a38" strokeWidth="2" />
                </svg>
              )}
              {lineW > 0 &&
                Array.from({ length: Math.floor(lineW / SEGMENT) + 1 }, (_, k) => (
                  <span key={k} aria-hidden className="lantern-breath pointer-events-none absolute top-6 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: k * SEGMENT, background: "radial-gradient(circle at 45% 40%, #fff3d6, #f5c27a 45%, #c97a35 80%)", boxShadow: "0 0 40px 16px rgb(255 190 110 / 0.45)" }} />
                ))}

              <ol className="relative flex items-start gap-14">
                {chapters.map((c) => (
                  <li key={c.id} data-chapter={c.id} className="flex items-start gap-12">
                    <Tag id={`ch-${c.id}`} title={c.title} line={c.line} />
                    <ul aria-labelledby={`ch-${c.id}`} className="flex items-start gap-12">
                      {c.photos.map((p) => {
                        const i = n++;
                        return <Hanging key={p.id} p={p} i={i} swing={swing} onOpen={openAt(p.id)} />;
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            </motion.div>

            <nav aria-label="Chapters" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-5 rounded-full bg-espresso/85 px-6 py-2 font-hand text-2xl backdrop-blur">
              {chapters.map((c, k) => (
                <button key={c.id} type="button" onClick={() => goTo(k)} aria-current={k === active ? "true" : undefined} className={`ink whitespace-nowrap ${k === active ? "bg-[length:100%_2px] text-[#f2b27a]" : "text-cream/85 hover:text-cream"}`}>
                  {c.title}
                </button>
              ))}
            </nav>
          </div>
        </section>
      ) : (
        <div className="py-12" style={{ backgroundImage: wall }}>
          {chapters.map((c) => (
            <section key={c.id} aria-labelledby={`ch-${c.id}`} className="mb-10">
              <div className="px-5">
                <h2 id={`ch-${c.id}`} className="font-hand text-5xl leading-none text-espresso">{c.title}</h2>
                <p className="mt-1 text-espresso/80">{c.line}</p>
              </div>
              <div className="relative mt-4">
                <span aria-hidden className="absolute inset-x-0 top-[1.1rem] h-0.5 bg-[#7a5a38]" />
                <ul className="flex snap-x snap-mandatory items-start gap-6 overflow-x-auto scroll-px-5 px-5 pb-6 pt-2 [scrollbar-width:none]">
                  {c.photos.map((p) => {
                    const i = n++;
                    return <Hanging key={p.id} p={p} i={i} onOpen={openAt(p.id)} phone />;
                  })}
                </ul>
              </div>
            </section>
          ))}
          <p aria-hidden className="px-5 font-hand text-2xl text-espresso/70">swipe along each line →</p>
        </div>
      )}

      <dialog
        ref={dialog}
        aria-label={cur ? cur.caption : "Photo"}
        onClose={() => { setOpen(null); opener.current?.focus(); }}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const s = touchX.current;
          touchX.current = null;
          const end = e.changedTouches[0]?.clientX;
          if (s === null || end === undefined) return;
          if (Math.abs(end - s) > 50) step(end < s ? 1 : -1);
        }}
        className="m-auto max-h-[96svh] w-[min(96vw,1200px)] touch-pan-y overflow-y-auto bg-transparent p-0 text-cream backdrop:bg-[#140c08]/92 backdrop:backdrop-blur-sm"
      >
        {cur && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={cur.id}
              initial={reduce ? false : { opacity: 0, x: 50 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -50 * dir }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="relative mx-auto mt-5 p-2.5 pb-3 drop-shadow-[0_30px_50px_rgb(0_0_0/0.6)] sm:p-3" style={{ maxWidth: `min(100%, calc(76svh * ${cur.width / cur.height}))` }}>
                <div aria-hidden className="paper absolute inset-0" />
                <span aria-hidden className="tape" />
                <Image src={cur.src} alt={cur.alt} width={cur.width} height={cur.height} sizes="96vw" quality={85} draggable={false} className="paper-photo relative h-auto w-full" />
                <figcaption className="relative mt-2 flex items-baseline justify-between gap-4 px-1 text-espresso">
                  <span className="font-hand text-2xl leading-tight sm:text-3xl">{cur.caption}</span>
                  <span className="shrink-0 font-hand text-xl text-terracotta-deep">{cur.chapter}</span>
                </figcaption>
              </div>
            </motion.figure>
          </AnimatePresence>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="rounded-full border border-cream/60 px-4 py-2 text-sm hover:bg-cream/10">← Prev</button>
          <span className="min-w-[4.5rem] text-center text-sm text-cream/85">{(open ?? 0) + 1} of {all.length}</span>
          <button type="button" onClick={() => step(1)} aria-label="Next photo" className="rounded-full border border-cream/60 px-4 py-2 text-sm hover:bg-cream/10">Next →</button>
          <button type="button" autoFocus onClick={() => setOpen(null)} className="ml-2 rounded-full bg-cream px-5 py-2 text-sm text-espresso">Close</button>
        </div>
      </dialog>
    </>
  );
}
