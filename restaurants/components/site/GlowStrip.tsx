"use client";

import { useRef, type ReactNode } from "react";

// The lantern glow brightens where the pointer comes near.
export function GlowStrip({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="group relative"
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const b = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${e.clientX - b.left}px`);
        el.style.setProperty("--gy", `${e.clientY - b.top}px`);
      }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-[250ms] group-hover:opacity-100 motion-reduce:hidden"
        style={{ background: "radial-gradient(circle 220px at var(--gx, 50%) var(--gy, 50%), rgba(255,190,90,0.55), rgba(255,160,60,0) 70%)" }}
      />
    </div>
  );
}
