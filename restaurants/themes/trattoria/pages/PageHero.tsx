"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Ink, type InkName } from "../signature/Ink";
import { usePassing } from "../signature/useScene";

// Candlelit page header for the inner pages: dimmed photo drifting behind, ink drawing itself, big title.
export function PageHero({
  kicker,
  title,
  line,
  photo,
  focal = "50% 50%",
  ink,
  inkClass = "top-[26%] w-24 md:w-40",
  push = false,
}: {
  kicker: string;
  title: string;
  line?: string;
  photo: string;
  focal?: string;
  ink?: InkName;
  inkClass?: string;
  /** slow push deeper into the photo as you scroll past */
  push?: boolean;
}) {
  const { ref, progress } = usePassing();
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], ["-10%", "14%"]);
  const textY = useTransform(progress, [0.5, 1], [0, -70]);
  const scale = useTransform(progress, [0.5, 1], [1, push ? 1.14 : 1]);
  const draw = useMotionValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(draw, 1, { duration: 1.6, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] });
    return () => controls.stop();
  }, [draw, reduce]);

  return (
    <section ref={ref} data-hero className="relative isolate flex h-[56svh] min-h-[24rem] items-end overflow-hidden bg-espresso text-cream md:h-[64svh]">
      <motion.div className="absolute inset-[-14%_0] -z-10 opacity-60" style={{ y, scale }}>
        <PhotoSlot photo={photo} ratio="h-full w-full" sizes="100vw" hero focal={focal} className="h-full" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso via-espresso/45 to-espresso/70" />
      {ink && (
        <div aria-hidden className={`absolute right-[6%] text-cream/75 md:right-[10%] ${inkClass}`}>
          <Ink name={ink} draw={draw} strokeWidth={1.4} />
        </div>
      )}
      <motion.div className="mx-auto w-full max-w-6xl px-5 pb-12 md:px-8 md:pb-16" style={{ y: textY }}>
        <p className="font-hand text-3xl text-[#f2b27a] md:text-4xl">{kicker}</p>
        <h1 className="mt-1 text-5xl leading-[0.95] md:text-7xl">{title}</h1>
        {line && <p className="mt-4 max-w-xl text-lg text-cream/85 md:text-xl">{line}</p>}
      </motion.div>
    </section>
  );
}
