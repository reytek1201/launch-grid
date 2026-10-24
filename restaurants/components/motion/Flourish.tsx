"use client";

import { motion, useReducedMotion } from "framer-motion";

// A hand-drawn underline that inks itself in when it scrolls into view.
export function Flourish({ className = "", width = 160 }: { className?: string; width?: number }) {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden viewBox="0 0 200 14" width={width} height={(width * 14) / 200} className={`text-terracotta ${className}`} fill="none">
      <motion.path
        d="M3 9 C 28 3, 55 13, 92 7 S 150 3, 197 8"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      />
    </svg>
  );
}
