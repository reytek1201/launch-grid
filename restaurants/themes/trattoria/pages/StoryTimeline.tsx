"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useId, useRef } from "react";
import { PhotoSlot } from "@/components/PhotoSlot";
import { RusticCard } from "@/components/site/RusticCard";
import type { StoryChapter } from "@/lib/types";

const PHASES = [0.25, 0.45, 0.65, 0.85, 1];

/** One moon, waxing with the generations. */
function Moon({ phase, className = "" }: { phase: number; className?: string }) {
  const id = useId();
  return (
    <svg aria-hidden viewBox="0 0 28 28" className={className} fill="currentColor">
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
          <circle cx="14" cy="14" r="11" fill="white" />
          {phase < 1 && <circle cx={14 - phase * 22} cy="14" r="11" fill="black" />}
        </mask>
      </defs>
      <circle cx="14" cy="14" r="11" fill="var(--color-cream)" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="14" r="11" mask={`url(#${id})`} />
    </svg>
  );
}

function Row({ c, i }: { c: StoryChapter; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  // The moon lights as its chapter reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "start 45%"] });
  const glow = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const pop = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const flip = i % 2 === 1;

  return (
    <li ref={ref} className="relative grid gap-5 pb-16 pl-12 last:pb-0 md:grid-cols-2 md:gap-16 md:pl-0">
      <motion.span
        aria-hidden
        className="absolute left-0 top-1 z-10 text-terracotta-deep md:left-1/2 md:-ml-[17px]"
        style={reduce ? undefined : { opacity: glow, scale: pop }}
      >
        <Moon phase={PHASES[Math.min(i, PHASES.length - 1)]} className="h-[34px] w-[34px] drop-shadow-[0_2px_6px_rgb(43_29_20/0.25)]" />
      </motion.span>

      <div className={flip ? "md:order-2 md:pl-4" : "md:pr-4 md:text-right"}>
        <p className="font-hand text-5xl leading-none text-terracotta-deep md:text-6xl">{c.year}</p>
        <h3 className="mt-2 font-heading text-2xl leading-tight md:text-3xl">{c.title}</h3>
        <p className={`mt-3 max-w-md text-lg leading-relaxed text-espresso/90 ${flip ? "" : "md:ml-auto"}`}>{c.text}</p>
      </div>

      <motion.div
        className={flip ? "md:order-1 md:pr-4" : "md:pl-4"}
        initial={reduce ? false : { opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <RusticCard className={flip ? "-rotate-1" : "rotate-1"} pad="p-3 pb-4">
          <PhotoSlot photo={c.photo} ratio="aspect-[4/3]" focal={c.focal} sizes="(min-width: 768px) 40vw, 90vw" className="paper-photo" />
          <p className="mt-2 px-1 font-hand text-2xl text-espresso/80">{c.caption}</p>
        </RusticCard>
      </motion.div>
    </li>
  );
}

// Five chapters on a thread: the spine inks itself in as you scroll, one moon per generation.
export function StoryTimeline({ chapters }: { chapters: StoryChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });

  return (
    <div ref={ref} className="relative">
      {/* The thread: a dashed ghost, and ink that fills it */}
      <span aria-hidden className="absolute bottom-0 left-[16px] top-0 w-0 border-l-2 border-dashed border-espresso/25 md:left-1/2 md:-ml-px" />
      <motion.span
        aria-hidden
        className="absolute bottom-0 left-[15px] top-0 w-[3px] origin-top rounded-full bg-terracotta-deep md:left-1/2 md:-ml-[1.5px]"
        style={{ scaleY: reduce ? 1 : scrollYProgress }}
      />
      <ol className="relative">
        {chapters.map((c, i) => <Row key={c.year} c={c} i={i} />)}
      </ol>
    </div>
  );
}
