"use client";

import { type MotionValue, useTransform } from "framer-motion";

// Function-form transforms keep Framer from handing opacity to a native
// ScrollTimeline, which mis-maps sub-ranges of the scroll.
export function useRamp(
  value: MotionValue<number>,
  [start, end]: [number, number],
  [from, to]: [number, number],
) {
  return useTransform(value, (input) => {
    const t = Math.min(1, Math.max(0, (input - start) / (end - start)));
    return from + (to - from) * t;
  });
}
