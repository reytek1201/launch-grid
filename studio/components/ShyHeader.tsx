"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sticky site header that slides away while you scroll down and comes back the moment you scroll up.
 * Always shown near the top of the page and while anything inside it has keyboard focus.
 * One passive scroll listener, work batched into a single rAF.
 */
export function ShyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = window.scrollY, raf = 0, hidden = false;
    const set = (h: boolean) => { if (h !== hidden) { hidden = h; el.dataset.hide = String(h); } };
    const tick = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY), dy = y - last;
      el.dataset.top = String(y < 8);
      if (y < el.offsetHeight + 40) set(false);
      else if (dy > 6) set(!el.contains(document.activeElement));
      else if (dy < -6) set(false);
      if (Math.abs(dy) > 6 || y < 8) last = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onFocus = () => set(false);
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("focusin", onFocus);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); el.removeEventListener("focusin", onFocus); };
  }, []);

  return <header ref={ref} className="site-header" data-hide="false" data-top="true">{children}</header>;
}
