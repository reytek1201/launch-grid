"use client";

import { useEffect, useState } from "react";
import { DESKTOP, useMedia } from "./useMedia";

export function useHideOnScroll(resetKey?: string, everywhere = false) {
  const desktop = useMedia(DESKTOP) && !everywhere;
  const [hidden, setHidden] = useState(false);
  const [route, setRoute] = useState(resetKey);
  const [layout, setLayout] = useState(desktop);

  if (route !== resetKey || layout !== desktop) {
    setRoute(resetKey);
    setLayout(desktop);
    setHidden(false);
  }

  useEffect(() => {
    if (desktop) return;

    let anchor = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 12) {
        anchor = y;
        setHidden(false);
        return;
      }
      if (y > anchor + 16) {
        anchor = y;
        setHidden(true);
      } else if (y < anchor - 16) {
        anchor = y;
        setHidden(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [desktop]);

  return desktop ? false : hidden;
}
