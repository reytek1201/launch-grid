"use client";

import Link from "next/link";
import { type MotionValue, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { useEffect, useRef } from "react";
import { PhotoSlot } from "@/components/PhotoSlot";
import { DESKTOP, useMedia } from "@/components/motion/useMedia";
import { useRamp } from "@/components/motion/useRamp";
import { RusticCard } from "@/components/site/RusticCard";
import { price } from "@/lib/format";
import type { MenuItem } from "@/lib/types";
import type { Course } from "./CourseScene";
import { Ink } from "./Ink";
import { useScene } from "./useScene";

const TILT = [-2.5, 1.5, -1, 2.5, -2, 1];

function Ticket({ dish, i, swing, label }: { dish: MenuItem; i: number; swing?: MotionValue<number>; label?: boolean }) {
  const still = useMotionValue(0);
  const s = swing ?? still;
  // Each ticket swings on its clip a little differently.
  const rotate = useTransform(s, (v) => TILT[i % TILT.length] + v * (0.7 + (i % 3) * 0.2));
  return (
    <motion.div className="relative origin-top" style={{ rotate }}>
      <span aria-hidden className="brass absolute -top-3 left-1/2 z-10 h-5 w-9 -translate-x-1/2 rounded-sm" />
      <Link href={`/menu#${dish.id}`} className="group block text-espresso">
        <RusticCard tape={false} className="transition-transform duration-[250ms] group-hover:-translate-y-1">
          <PhotoSlot photo={dish.photo} ratio="aspect-[4/5]" sizes="(min-width: 768px) 18rem, 46vw" className="paper-photo" />
          <p className={`mt-2 px-1 text-sm leading-snug md:text-base ${dish.soldOut ? "line-through opacity-70" : ""}`}>
            <span className="ink">{dish.name}</span>
          </p>
          {!label && <p className="px-1 text-sm font-semibold text-terracotta-deep">{dish.soldOut ? "finito" : price(dish.price)}</p>}
        </RusticCard>
      </Link>
    </motion.div>
  );
}

export function TableScene({ course }: { course: Course }) {
  const { ref, reduce, progress } = useScene(0);
  const desktop = useMedia(DESKTOP);
  const track = useRef<HTMLDivElement>(null);
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
  // Tickets swing on the rail with the speed of the scroll, then settle.
  const velocity = useVelocity(progress);
  const swing = useSpring(useTransform(velocity, (v) => Math.max(-9, Math.min(9, -v * 30))), { stiffness: 90, damping: 7 });
  const draw = useRamp(progress, [0, 0.4], [0, 1]);
  const inkY = useTransform(progress, [0, 1], [120, -120]);
  const titleOpacity = useRamp(progress, [0, 0.1], [0.3, 1]);
  const bgX = useTransform(progress, [0, 1], ["0%", "-8%"]);

  const header = (
    <>
      <p className="font-heading text-sm uppercase tracking-[0.3em] text-[#f2b27a]">Course {course.numeral}</p>
      <h2 className="mt-1 font-hand text-6xl leading-none md:text-8xl">{course.title}</h2>
      <p className="mt-4 text-lg text-cream/90 md:text-xl">{course.line}</p>
      <Link href={`/menu#${course.id}`} className="ink mt-5 inline-block font-semibold text-[#f2b27a]">All the {course.title.toLowerCase()} →</Link>
    </>
  );

  if (!sideways) {
    // Phones and reduced motion: the same rail, swiped sideways by hand.
    return (
      <section id={`course-${course.id}`} data-course={course.id} aria-label={course.title} className="relative overflow-hidden bg-espresso py-14 text-cream">
        <div aria-hidden className="absolute inset-0 opacity-35">
          <PhotoSlot photo="sp-03b" ratio="h-full w-full" sizes="100vw" focal="50% 60%" className="h-full" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/40 to-espresso/90" />
        <div className="relative px-5">{header}</div>
        <div className="relative mt-10">
          <span aria-hidden className="brass absolute left-0 right-0 top-0 h-2 rounded-full" />
          <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-6 pt-8 [scrollbar-width:none]">
            {course.backdrop && (
              <li className="w-[64vw] max-w-72 shrink-0 snap-start">
                <Ticket dish={{ id: course.id, name: "Rolled by hand, every morning", price: null, photo: course.backdrop }} i={5} label />
              </li>
            )}
            {course.dishes.map((d, i) => (
              <li key={d.id} className="w-[64vw] max-w-72 shrink-0 snap-start">
                <Ticket dish={d} i={i} />
              </li>
            ))}
          </ul>
          <p aria-hidden className="px-5 font-hand text-xl text-cream/60">swipe the orders →</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id={`course-${course.id}`} data-course={course.id} aria-label={course.title} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden bg-espresso text-cream">
        {/* The long table, drifting slower than the tickets */}
        <motion.div aria-hidden className="absolute inset-y-0 -left-[4%] -right-[12%] opacity-45" style={{ x: bgX }}>
          <PhotoSlot photo="sp-03b" ratio="h-full w-full" sizes="100vw" focal="50% 60%" className="h-full" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-espresso/75 via-espresso/25 to-espresso/85" />
        <motion.div aria-hidden className="pointer-events-none absolute right-[8%] top-[10%] w-40 text-cream/60" style={{ y: inkY }}>
          <Ink name="fork" draw={draw} className="inline-block w-10" />
          <Ink name="knife" draw={draw} className="ml-3 inline-block w-10" />
        </motion.div>

        <motion.div ref={track} className="relative flex w-max items-center gap-12 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-24" style={{ x }}>
          <motion.div className="w-[24rem] shrink-0" style={{ opacity: titleOpacity }}>{header}</motion.div>
          <div className="relative flex items-start gap-10 pt-10">
            {/* The ticket rail: a brass bar the orders hang from, like the pass in a kitchen */}
            <span aria-hidden className="brass absolute left-[-2rem] right-[-2rem] top-0 h-2.5 rounded-full" />
            {course.backdrop && (
              <div className="w-64 shrink-0 xl:w-72">
                <Ticket dish={{ id: course.id, name: "Rolled by hand, every morning", price: null, photo: course.backdrop }} i={5} swing={swing} label />
              </div>
            )}
            <ul className="flex items-start gap-10">
              {course.dishes.map((d, i) => (
                <li key={d.id} className="w-60 shrink-0 xl:w-72">
                  <Ticket dish={d} i={i} swing={swing} />
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        <p aria-hidden className="absolute bottom-6 left-1/2 -translate-x-1/2 font-hand text-xl text-cream/60">keep scrolling, the orders are up →</p>
      </div>
    </section>
  );
}
