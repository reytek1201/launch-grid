"use client";

import { type MotionValue, motion, useMotionValue, useTransform } from "framer-motion";

// Hand-drawn ink illustrations. Strokes draw in with `draw` (0..1); fills wash in at the end.
type Stroke = { d: string; fill?: "terra" | "olive" };

const ART: Record<string, { viewBox: string; strokes: Stroke[] }> = {
  plate: {
    viewBox: "0 0 100 100",
    strokes: [
      { d: "M50 8 C 74 8, 92 26, 92 50 C 92 74, 74 92, 50 92 C 26 92, 8 74, 8 50 C 8 27, 26 8, 50 8 Z", fill: "terra" },
      { d: "M50 22 C 66 21, 79 34, 78 50 C 78 66, 66 78, 50 78 C 34 79, 22 66, 22 50 C 21 34, 34 22, 50 22 Z" },
    ],
  },
  fork: {
    viewBox: "0 0 40 140",
    strokes: [
      { d: "M10 6 L10 34 C 10 44, 14 49, 20 50 C 26 49, 30 44, 30 34 L30 6" },
      { d: "M17 6 L17 36 M23 6 L23 36" },
      { d: "M20 50 C 18 70, 17 100, 19 134 L21 134 C 23 100, 22 70, 20 50" },
    ],
  },
  knife: {
    viewBox: "0 0 40 140",
    strokes: [
      { d: "M18 70 L18 8 C 30 14, 32 40, 26 70 Z", fill: "terra" },
      { d: "M18 70 C 16 90, 16 110, 18 134 L24 134 C 26 110, 26 90, 26 70" },
    ],
  },
  glass: {
    viewBox: "0 0 80 140",
    strokes: [
      { d: "M14 8 C 10 40, 18 62, 40 66 C 62 62, 70 40, 66 8 Z" },
      { d: "M17 34 C 30 38, 50 30, 64 34 C 62 52, 54 62, 40 63 C 26 62, 18 52, 17 34 Z", fill: "terra" },
      { d: "M40 66 C 39 90, 41 110, 40 126 M18 130 C 30 124, 50 124, 62 130" },
    ],
  },
  olive: {
    viewBox: "0 0 160 100",
    strokes: [
      { d: "M6 92 C 50 72, 100 46, 154 8" },
      { d: "M38 77 C 36 62, 46 52, 58 50 C 58 64, 50 74, 38 77 Z", fill: "olive" },
      { d: "M62 64 C 74 74, 88 74, 98 66 C 86 56, 72 56, 62 64 Z", fill: "olive" },
      { d: "M92 42 C 90 28, 100 18, 112 16 C 112 30, 104 40, 92 42 Z", fill: "olive" },
      { d: "M116 30 C 128 40, 142 40, 150 32 C 140 22, 126 22, 116 30 Z", fill: "olive" },
      { d: "M74 52 C 70 52, 68 56, 70 60 C 74 62, 78 58, 76 54 Z M128 18 C 124 18, 122 22, 124 26 C 128 28, 132 24, 130 20 Z", fill: "terra" },
    ],
  },
  lantern: {
    viewBox: "0 0 60 110",
    strokes: [
      { d: "M30 0 L30 22 M22 22 L38 22" },
      { d: "M30 24 C 46 24, 54 40, 54 54 C 54 70, 44 84, 30 84 C 16 84, 6 70, 6 54 C 6 40, 14 24, 30 24 Z", fill: "terra" },
      { d: "M30 24 C 20 40, 20 70, 30 84 M30 24 C 40 40, 40 70, 30 84 M8 46 C 22 50, 38 50, 52 46 M8 64 C 22 68, 38 68, 52 64" },
      { d: "M24 86 L36 86 M30 86 L30 96" },
    ],
  },
  cup: {
    viewBox: "0 0 120 110",
    strokes: [
      { d: "M26 44 L32 80 C 46 88, 66 88, 80 80 L86 44 Z", fill: "terra" },
      { d: "M86 52 C 102 50, 104 70, 84 72" },
      { d: "M12 88 C 40 100, 80 100, 108 88" },
      { d: "M46 36 C 40 28, 48 22, 44 12 M62 36 C 56 28, 64 22, 60 10" },
    ],
  },
  bread: {
    viewBox: "0 0 140 80",
    strokes: [
      { d: "M10 52 C 8 24, 40 12, 70 12 C 100 12, 132 24, 130 52 C 130 66, 100 70, 70 70 C 40 70, 10 66, 10 52 Z", fill: "terra" },
      { d: "M36 30 L48 46 M60 24 L72 42 M84 24 L96 42" },
    ],
  },
};

export type InkName = keyof typeof ART;

const FILL = { terra: "var(--color-terracotta)", olive: "var(--color-olive)" };

export function Ink({
  name,
  draw,
  className = "",
  strokeWidth = 1.4,
}: {
  name: InkName;
  draw?: MotionValue<number>;
  className?: string;
  strokeWidth?: number;
}) {
  const full = useMotionValue(1);
  const d = draw ?? full;
  const fillOpacity = useTransform(d, (v) => Math.max(0, (v - 0.75) / 0.25) * 0.35);
  const art = ART[name];
  return (
    <svg aria-hidden viewBox={art.viewBox} className={className} fill="none">
      {art.strokes.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={s.fill ? FILL[s.fill] : "none"}
          style={{ pathLength: d, fillOpacity: s.fill ? fillOpacity : 0 }}
        />
      ))}
    </svg>
  );
}
