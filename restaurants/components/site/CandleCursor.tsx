"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";
import { FINE_POINTER, useMedia } from "@/components/motion/useMedia";

const ALIVE = "a, button, input, textarea, select, summary, label, [data-alive]";

export default function CandleCursor() {
  const fine = useMedia(FINE_POINTER);
  const reduce = useReducedMotion();
  const on = fine && !reduce;
  const x = useSpring(useMotionValue(-400), { stiffness: 140, damping: 22, mass: 0.6 });
  const y = useSpring(useMotionValue(-400), { stiffness: 140, damping: 22, mass: 0.6 });
  const strength = useSpring(useMotionValue(0.55), { stiffness: 180, damping: 20 });
  const scale = useSpring(useMotionValue(1), { stiffness: 180, damping: 20 });

  useEffect(() => {
    if (!on) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const alive = e.target instanceof Element && e.target.closest(ALIVE) !== null;
      strength.set(alive ? 1 : 0.55);
      scale.set(alive ? 1.35 : 1);
    };
    const leave = () => { strength.set(0); };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [on, x, y, strength, scale]);

  if (!on) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        x, y, scale, opacity: strength,
        background: "radial-gradient(circle, rgba(255,176,72,0.30) 0%, rgba(255,150,50,0.12) 38%, rgba(255,150,50,0) 70%)",
        mixBlendMode: "soft-light",
        willChange: "transform",
      }}
    />
  );
}
