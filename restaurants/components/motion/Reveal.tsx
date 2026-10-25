"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const HIDE = { opacity: 0, y: 40, clipPath: "inset(0 0 30% 0)" };
const SHOW = { opacity: 1, y: 0, clipPath: "inset(-3rem -1.5rem -40% -1.5rem)" };

/*
 * Eases content in as it scrolls into view.
 * Content that starts on screen is never hidden: the server-rendered HTML shows it at once,
 * so nothing waits for JavaScript. Only content below the fold is tucked away (right after
 * hydration, before anyone can scroll to it) and revealed when it arrives.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.25 });
  const [belowFold, setBelowFold] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.85) setBelowFold(true);
  }, []);

  const hidden = belowFold && !seen && !reduce;

  return (
    <motion.div
      ref={ref}
      className={`${className} motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:[clip-path:none!important]`}
      initial={false}
      animate={hidden ? HIDE : SHOW}
      transition={hidden ? { duration: 0 } : { duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
