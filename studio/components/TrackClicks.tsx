"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

/** Counts clicks on any element marked data-track="Event name" (Vercel Web Analytics custom events). */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track;
      if (name) track(name);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
