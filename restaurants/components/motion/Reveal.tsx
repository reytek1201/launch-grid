"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`${className} motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:[clip-path:none!important]`}
      initial={{ opacity: 0, y: 40, clipPath: "inset(0 0 30% 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(-3rem -1.5rem -40% -1.5rem)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
