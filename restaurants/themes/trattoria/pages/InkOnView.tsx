"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Ink, type InkName } from "../signature/Ink";

// An ink drawing that draws itself the first time it scrolls into view.
export function InkOnView({ name, className = "" }: { name: InkName; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const draw = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (!seen || reduce) return;
    const c = animate(draw, 1, { duration: 1.2, ease: [0.2, 0.7, 0.2, 1] });
    return () => c.stop();
  }, [seen, reduce, draw]);
  return (
    <div ref={ref} aria-hidden className={className}>
      <Ink name={name} draw={draw} strokeWidth={1.4} />
    </div>
  );
}
