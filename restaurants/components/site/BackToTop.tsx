"use client";

import { useEffect, useState } from "react";
import { scrollToTop } from "@/components/motion/scrollToTop";

// Appears once you are well past the first screen. On phones it sits above the quick-actions tray.
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.scrollY > window.innerHeight * 1.5);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      className={`fixed bottom-20 right-4 z-30 grid h-12 w-12 place-items-center rounded-full border border-cream/40 bg-espresso text-cream shadow-[0_8px_22px_rgb(20_12_8/0.45)] transition-[opacity,transform,background-color,visibility] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:bg-terracotta-deep md:bottom-6 md:right-6 motion-reduce:transition-none ${show ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 11l7-7 7 7" />
      </svg>
    </button>
  );
}
