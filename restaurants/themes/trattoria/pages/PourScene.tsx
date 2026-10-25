"use client";

import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { PhotoSlot } from "@/components/PhotoSlot";
import { useRamp } from "@/components/motion/useRamp";
import { price } from "@/lib/format";
import { useScene } from "../signature/useScene";

export type PourWine = {
  id: string;
  name: string;
  where: string;
  notes?: string;
  glass?: number;
  bottle?: number;
  kind: "sparkling" | "white" | "rose" | "red" | "sweet";
};
export type PourDish = { id: string; name: string; wines: string[] };
export type PourCourse = { id: string; title: string; dishes: PourDish[] };

const COLOR: Record<PourWine["kind"], string> = {
  red: "#6b1526",
  white: "#d8b65a",
  rose: "#e28c86",
  sparkling: "#e9d58f",
  sweet: "#b9732a",
};
const EASE = [0.2, 0.7, 0.2, 1] as const;

/*
 * Abbinamento. Pinned: the pour photo pushes in, an ink glass draws itself and fills,
 * the question writes in, then the dish chips and the answer card arrive.
 * Pick a dish: the glass takes the wine's colour with a fresh little pour,
 * and one or two wines are offered with prices and a link down to the list.
 * Prices and names never animate in place; the card swaps as a whole.
 * Reduced motion: no pin, everything is simply there.
 */
export function PourScene({ courses, wines }: { courses: PourCourse[]; wines: Record<string, PourWine> }) {
  const { ref, progress, reduce } = useScene();
  const [courseId, setCourseId] = useState(courses.find((c) => c.id === "primi")?.id ?? courses[0]?.id);
  const [dishId, setDishId] = useState<string | null>(null);
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const dishes = courses.flatMap((c) => c.dishes);
  const [ready, setReady] = useState(false);

  useMotionValueEvent(progress, "change", (v) => setReady(v > 0.42));

  const photoScale = useTransform(progress, [0, 1], [1, 1.07]);
  const outline = useRamp(progress, [0.05, 0.3], [0, 1]);
  const pour = useRamp(progress, [0.25, 0.55], [0, 1]);
  const words = useRamp(progress, [0.3, 0.45], [0, 1]);
  const wordsY = useTransform(words, [0, 1], [24, 0]);
  const tools = useRamp(progress, [0.42, 0.55], [0, 1]);
  const toolsY = useTransform(tools, [0, 1], [24, 0]);

  // A fresh pour each time the dish changes: the level dips and comes back up.
  const refill = useMotionValue(1);
  useEffect(() => {
    if (!dishId || reduce) return;
    refill.set(0.35);
    const c = animate(refill, 1, { duration: 0.9, ease: EASE });
    return () => c.stop();
  }, [dishId, reduce, refill]);
  const level = useTransform([pour, refill], ([a, b]: number[]) => a * b);
  // Bowl interior runs from y=80 (empty) to y=24 (full to the line).
  const liquidY = useTransform(level, (l) => 80 - l * 46);

  const dish = dishes.find((d) => d.id === dishId);
  const offered = (dish?.wines ?? []).map((id) => wines[id]).filter(Boolean);
  const kind = offered[0]?.kind ?? "red";

  return (
    <section ref={ref} aria-labelledby="pour-title" className={reduce ? "relative" : "relative h-[230vh]"}>
      <div className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-lvh"} overflow-hidden bg-[#170d0a] text-cream`}>
        {/* Wider screens: the photo sits right of centre and its left edge melts into the dark,
            so the glass and the whole bottle clear the words. The push-in is anchored on the bottle. */}
        <motion.div
          aria-hidden
          className="pour-photo absolute inset-x-0 top-0 h-[52%] origin-[70%_50%] md:inset-y-0 md:left-[14%] md:right-[-6%] md:h-auto md:origin-[80%_55%]"
          style={{ scale: reduce ? 1 : photoScale }}
        >
          <PhotoSlot photo="sp-14" ratio="h-full w-full" sizes="100vw" focal="68% 50%" className="h-full" />
        </motion.div>
        {/* The lanterns breathe a little */}
        <div aria-hidden className="lantern-breath pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: "radial-gradient(circle at 78% 12%, rgba(255,196,120,0.35), rgba(255,160,70,0) 34%)" }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#170d0a] from-40% via-[#170d0a]/40 to-transparent md:bg-gradient-to-r md:from-[#170d0a] md:via-[#170d0a]/80 md:to-transparent" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end gap-6 px-5 pb-24 pt-24 md:justify-center md:px-8 md:pb-0">
          <div className="flex items-end gap-5 md:gap-8">
            {/* The ink glass that fills */}
            <svg aria-hidden viewBox="0 0 100 160" className="w-14 shrink-0 text-cream/85 md:w-24" fill="none">
              <defs>
                <clipPath id="bowl">
                  <path d="M22 10 C 18 40, 20 70, 50 82 C 80 70, 82 40, 78 10 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#bowl)">
                <motion.rect x="0" width="100" height="90" style={{ y: liquidY }} animate={{ fill: COLOR[kind] }} transition={{ duration: 0.6, ease: EASE }} />
                {kind === "sparkling" && !reduce &&
                  [30, 46, 58, 70].map((x, i) => (
                    <circle key={x} className="bubble" cx={x} cy={78} r={1.6} fill="rgba(255,255,255,0.8)" style={{ animationDelay: `${i * 0.35}s` }} />
                  ))}
              </g>
              {[
                "M22 10 C 18 40, 20 70, 50 82 C 80 70, 82 40, 78 10",
                "M50 82 L50 144",
                "M28 150 C 40 144, 60 144, 72 150",
              ].map((d) => (
                <motion.path key={d} d={d} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" style={{ pathLength: reduce ? 1 : outline }} />
              ))}
            </svg>

            <motion.div style={{ opacity: words, y: wordsY }}>
              <p className="font-hand text-3xl text-[#f2b27a] md:text-4xl">Abbinamento</p>
              <h2 id="pour-title" className="mt-1 max-w-md font-heading text-3xl leading-tight md:text-[2.6rem]">Not sure? Tell us what you are eating.</h2>
            </motion.div>
          </div>

          <motion.div inert={!(ready || reduce)} style={{ opacity: tools, y: toolsY }} className="md:max-w-xl">
            <p id="pour-help" className="text-cream/85">Pick a dish and we will pour you something that goes with it.</p>
            <div role="group" aria-label="Course" className="mt-3 flex gap-5 font-hand text-2xl">
              {courses.map((c) => (
                <button key={c.id} type="button" aria-pressed={c.id === course?.id} onClick={() => setCourseId(c.id)} className={`ink ${c.id === course?.id ? "bg-[length:100%_2px] text-[#f2b27a]" : "text-cream/80 hover:text-cream"}`}>
                  {c.title}
                </button>
              ))}
            </div>
            <ul aria-label={`${course?.title ?? ""} dishes`} className="-mx-5 mt-2 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {(course?.dishes ?? []).map((d) => {
                const on = d.id === dishId;
                return (
                  <li key={d.id} className="snap-start">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDishId(on ? null : d.id)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors duration-[250ms] ${on ? "border-cream bg-cream text-espresso" : "border-cream/45 text-cream hover:border-cream hover:bg-cream/10"}`}
                    >
                      {d.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div aria-live="polite" className="mt-4 min-h-[9.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                {dish ? (
                  <motion.div
                    key={dish.id}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="rounded-sm border border-cream/20 bg-[#1f2b26]/90 px-5 py-4 shadow-[0_18px_40px_rgb(0_0_0/0.45)] backdrop-blur-sm"
                  >
                    <p className="font-hand text-2xl text-[#f2b27a]">with the {dish.name}</p>
                    <ul className="divide-y divide-dashed divide-cream/20">
                      {offered.map((w) => (
                        <li key={w.id} className="flex items-start justify-between gap-4 py-2.5">
                          <div className="min-w-0">
                            <a href={`#${w.id}`} className="ink font-heading text-xl leading-snug">{w.name}</a>
                            <p className="text-xs uppercase tracking-[0.12em] text-cream/80">{w.where}</p>
                            {w.notes && <p className="mt-0.5 hidden text-sm text-cream/85 sm:block">{w.notes}</p>}
                          </div>
                          <p className="shrink-0 text-right text-sm">
                            {typeof w.glass === "number" && <span className="block"><span className="font-semibold">{price(w.glass)}</span> <span className="text-cream/80">glass</span></span>}
                            {typeof w.bottle === "number" && <span className="block"><span className="font-semibold">{price(w.bottle)}</span> <span className="text-cream/80">bottle</span></span>}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ) : (
                  <motion.p key="none" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} className="font-hand text-2xl text-cream/80">
                    …or ask us at the table. We love this part.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
