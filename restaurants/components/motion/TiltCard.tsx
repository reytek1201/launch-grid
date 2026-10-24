"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { FINE_POINTER, useMedia } from "./useMedia";

// Tilts toward the pointer, up to 6 degrees. Mouse only; static otherwise.
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const fine = useMedia(FINE_POINTER);
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const active = fine && !reduce;

  return (
    <motion.div
      className={className}
      style={active ? { rotateX: rx, rotateY: ry, transformPerspective: 800 } : undefined}
      onPointerMove={(e) => {
        if (!active) return;
        const b = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - b.left) / b.width - 0.5) * 12);
        rx.set(-((e.clientY - b.top) / b.height - 0.5) * 12);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}
