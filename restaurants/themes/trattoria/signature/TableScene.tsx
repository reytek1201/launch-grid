"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { PhotoSlot } from "@/components/PhotoSlot";
import { DESKTOP, useMedia } from "@/components/motion/useMedia";
import { useRamp } from "@/components/motion/useRamp";
import { price } from "@/lib/format";
import type { Course } from "./CourseScene";
import { Ink } from "./Ink";
import { useScene } from "./useScene";

const WOOD =
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.03) 0 2px, transparent 2px 140px), linear-gradient(180deg, #4a3020 0%, #3a2416 40%, #2e1c11 100%)";

function Plates({ course }: { course: Course }) {
  return (
    <>
      {course.dishes.map((d, i) => (
        <li key={d.id} className={`flex w-64 shrink-0 flex-col items-center text-center ${i % 2 ? "md:translate-y-10" : "md:-translate-y-4"}`}>
          <Link href={`/menu#${d.id}`} className="group block">
            {d.photo ? (
              <div className="rounded-full p-1.5 shadow-[0_24px_40px_rgb(0_0_0/0.5)] transition-transform duration-[250ms] group-hover:-translate-y-1.5" style={{ background: "#f6eedd" }}>
                <PhotoSlot photo={d.photo} ratio="aspect-square" sizes="16rem" focal="50% 62%" className="w-56 rounded-full" />
              </div>
            ) : (
              <div className="flex aspect-square w-56 items-center justify-center rounded-full border-2 border-cream/50 shadow-[0_24px_40px_rgb(0_0_0/0.45)] transition-transform duration-[250ms] group-hover:-translate-y-1.5">
                <span aria-hidden className="flex h-[72%] w-[72%] items-center justify-center rounded-full border border-cream/30 font-hand text-3xl text-[#f2b27a]">{d.soldOut ? "finito" : "fatto a mano"}</span>
              </div>
            )}
            <p className={`mt-4 font-heading text-lg leading-snug ${d.soldOut ? "line-through opacity-70" : ""}`}><span className="ink">{d.name}</span></p>
            <p className="text-sm text-[#f2b27a]">{d.soldOut ? "finito" : price(d.price)}</p>
          </Link>
        </li>
      ))}
    </>
  );
}

export function TableScene({ course }: { course: Course }) {
  const { ref, reduce, progress } = useScene(0);
  const desktop = useMedia(DESKTOP);
  const track = useRef<HTMLUListElement>(null);
  const distance = useMotionValue(0);
  const sideways = desktop && !reduce;

  useEffect(() => {
    const el = track.current;
    if (!el || !sideways) return;
    const ro = new ResizeObserver(() => distance.set(Math.max(0, el.scrollWidth - window.innerWidth + 64)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [sideways, distance]);

  const x = useTransform([progress, distance], ([p, d]: number[]) => -Math.min(1, Math.max(0, (p - 0.08) / 0.84)) * d);
  const draw = useRamp(progress, [0, 0.4], [0, 1]);
  const inkY = useTransform(progress, [0, 1], [120, -120]);
  const titleOpacity = useRamp(progress, [0, 0.1], [0.3, 1]);

  if (!sideways) {
    // Phones and reduced motion: the same plates, stacked.
    return (
      <section id={`course-${course.id}`} data-course={course.id} aria-label={course.title} className="relative overflow-hidden bg-espresso py-16 text-cream" style={{ backgroundImage: WOOD }}>
        <div className="px-5">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-[#f2b27a]">Course {course.numeral}</p>
          <h2 className="mt-1 font-hand text-6xl leading-none">{course.title}</h2>
          <p className="mt-3 text-lg text-cream/90">{course.line}</p>
          {course.backdrop && <PhotoSlot photo={course.backdrop} ratio="aspect-[4/5]" focal="50% 55%" sizes="100vw" className="mt-6 rounded-lg" />}
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 px-4 [&>li]:w-auto [&_.w-56]:w-full">
          <Plates course={course} />
        </ul>
        <p className="mt-10 px-5"><Link href={`/menu#${course.id}`} className="ink font-semibold text-[#f2b27a]">All the {course.title.toLowerCase()} →</Link></p>
      </section>
    );
  }

  return (
    <section ref={ref} id={`course-${course.id}`} data-course={course.id} aria-label={course.title} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden text-cream" style={{ backgroundImage: WOOD }}>
        <motion.div aria-hidden className="pointer-events-none absolute right-[8%] top-[6%] w-40 text-cream/60" style={{ y: inkY }}>
          <Ink name="fork" draw={draw} className="inline-block w-10" />
          <Ink name="knife" draw={draw} className="ml-3 inline-block w-10" />
        </motion.div>
        <motion.ul ref={track} className="flex items-center gap-14 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-16" style={{ x }}>
          <li className="w-[26rem] shrink-0">
            <motion.div style={{ opacity: titleOpacity }}>
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-[#f2b27a]">Course {course.numeral}</p>
              <h2 className="mt-1 font-hand text-8xl leading-none">{course.title}</h2>
              <p className="mt-4 text-xl text-cream/90">{course.line}</p>
              <Link href={`/menu#${course.id}`} className="ink mt-5 inline-block font-semibold text-[#f2b27a]">All the {course.title.toLowerCase()} →</Link>
            </motion.div>
          </li>
          {course.backdrop && (
            <li className="w-80 shrink-0 -rotate-2 bg-paper p-2 pb-8 shadow-[0_24px_40px_rgb(0_0_0/0.5)]">
              <PhotoSlot photo={course.backdrop} ratio="aspect-[4/5]" focal="50% 55%" sizes="20rem" />
            </li>
          )}
          <Plates course={course} />
        </motion.ul>
        <p aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 font-hand text-xl text-cream/60">keep scrolling, the table is long →</p>
      </div>
    </section>
  );
}
