"use client";

import { useMotionValue, useReducedMotion, useScroll } from "framer-motion";
import { useRef } from "react";

/** Progress 0..1 while a tall section scrolls past its sticky frame. Reduced motion gets a fixed value. */
export function useScene(stillAt = 1) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useMotionValue(stillAt);
  return { ref, reduce, progress: reduce ? still : scrollYProgress };
}

/** Progress 0..1 while a normal section crosses the viewport (for parallax drift). */
export function usePassing() {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const still = useMotionValue(0.5);
  return { ref, reduce, progress: reduce ? still : scrollYProgress };
}
