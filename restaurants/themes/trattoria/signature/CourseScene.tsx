"use client";

import Link from "next/link";
import { type MotionValue, motion, useTransform } from "framer-motion";
import { PhotoSlot } from "@/components/PhotoSlot";
import { useRamp } from "@/components/motion/useRamp";
import { price } from "@/lib/format";
import type { MenuItem } from "@/lib/types";
import { Ink, type InkName } from "./Ink";
import { useScene } from "./useScene";

export type Course = {
  id: string;
  title: string;
  numeral: string;
  line: string;
  backdrop?: string;
  ink: InkName[];
  dishes: MenuItem[];
};

const TILT = [-6, 4, -2, 5];

function Ticket({ dish, i, p, count }: { dish: MenuItem; i: number; p: MotionValue<number>; count: number }) {
  const start = 0.12 + (i * 0.42) / Math.max(1, count);
  const y = useTransform(p, [start, start + 0.22], ["110%", "0%"]);
  const rotate = useTransform(p, [start, start + 0.22], [TILT[i % 4] * 2.5, TILT[i % 4]]);
  const opacity = useRamp(p, [start, start + 0.08], [0, 1]);
  return (
    <motion.li className={`w-[46%] max-w-[15rem] shrink-0 md:w-56 lg:w-60 ${i > 1 ? "hidden md:block" : ""}`} style={{ y, rotate, opacity }}>
      <Link href={`/menu#${dish.id}`} className="group block bg-paper p-2 pb-3 text-espresso shadow-[0_18px_40px_rgb(20_12_8/0.45)]">
        {dish.photo ? (
          <PhotoSlot photo={dish.photo} ratio="aspect-[4/5]" sizes="(min-width: 768px) 15rem, 46vw" />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-cream p-4 text-center font-hand text-2xl text-terracotta-deep">
            {dish.name}
          </div>
        )}
        <p className="mt-2 px-1 text-sm leading-snug md:text-base"><span className="ink">{dish.name}</span></p>
        <p className="px-1 text-sm font-semibold text-terracotta-deep">{price(dish.price)}</p>
      </Link>
    </motion.li>
  );
}

function Frame({ c, p, still }: { c: Course; p: MotionValue<number>; still: boolean }) {
  const bgY = useTransform(p, [0, 1], ["-6%", "6%"]);
  const bgScale = useTransform(p, [0, 1], [1.18, 1.08]);
  const titleOpacity = useRamp(p, [0, 0.12], [0.4, 1]);
  const titleX = useTransform(p, [0, 0.2], [-40, 0]);
  const draw = useRamp(p, [0.05, 0.6], [0, 1]);
  const nearY = useTransform(p, [0, 1], [220, -220]);
  const farY = useTransform(p, [0, 1], [90, -90]);
  const numeralY = useTransform(p, [0, 1], ["20%", "-30%"]);

  return (
    <div className={`${still ? "relative min-h-svh py-20" : "sticky top-0 h-svh"} overflow-hidden bg-espresso text-cream`}>
      {c.backdrop && (
        <motion.div className="absolute inset-0 opacity-45" style={{ y: bgY, scale: bgScale }}>
          <PhotoSlot photo={c.backdrop} ratio="h-full w-full" sizes="100vw" className="h-full" />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/30 to-espresso/80" />

      {/* Roman numeral, far layer */}
      <motion.p aria-hidden className="pointer-events-none absolute -left-4 top-[6%] font-heading text-[42vw] leading-none text-cream/[0.06] md:left-[2%] md:text-[24vw]" style={{ y: numeralY }}>
        {c.numeral}
      </motion.p>

      {/* Ink, near and far layers */}
      {c.ink[0] && (
        <motion.div aria-hidden className="pointer-events-none absolute right-[4%] top-[8%] w-32 text-cream/85 md:w-56" style={{ y: farY }}>
          <Ink name={c.ink[0]} draw={draw} strokeWidth={1.6} />
        </motion.div>
      )}
      {c.ink[1] && (
        <motion.div aria-hidden className="pointer-events-none absolute bottom-[4%] left-[6%] hidden w-14 text-cream/85 md:block md:w-20" style={{ y: nearY }}>
          <Ink name={c.ink[1]} draw={draw} strokeWidth={1.6} />
        </motion.div>
      )}
      {c.ink[2] && (
        <motion.div aria-hidden className="pointer-events-none absolute bottom-[10%] right-[30%] hidden w-16 text-cream/80 lg:block" style={{ y: nearY }}>
          <Ink name={c.ink[2]} draw={draw} strokeWidth={1.6} />
        </motion.div>
      )}

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <motion.div className="md:max-w-sm" style={{ opacity: titleOpacity, x: titleX }}>
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-[#f2b27a]">Course {c.numeral}</p>
          <h2 className="mt-1 font-hand text-6xl leading-none md:text-8xl">{c.title}</h2>
          <p className="mt-4 text-lg text-cream/90 md:text-xl">{c.line}</p>
          <Link href={`/menu#${c.id}`} className="ink mt-5 inline-block font-semibold text-[#f2b27a]">
            All the {c.title.toLowerCase()} →
          </Link>
        </motion.div>
        <ul className="flex items-start justify-center gap-3 md:gap-5">
          {c.dishes.slice(0, 3).map((d, i, all) => (
            <Ticket key={d.id} dish={d} i={i} p={p} count={all.length} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CourseScene({ course }: { course: Course }) {
  const { ref, reduce, progress } = useScene(1);
  return (
    <section
      ref={ref}
      id={`course-${course.id}`}
      data-course={course.id}
      aria-label={course.title}
      className={reduce ? "relative" : "relative h-[200vh] md:h-[240vh]"}
    >
      <Frame c={course} p={progress} still={reduce} />
    </section>
  );
}
