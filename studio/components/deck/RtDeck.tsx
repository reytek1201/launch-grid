"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mounts the real Reytek deck (components/deck/rtdeck.js, ported from reytek1201.com) when the section is
 * about a screen away. three.js, the track data and the first track load only then, never on page load.
 */
export function RtDeck() {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"wait" | "ready" | "fail">("wait");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let off: (() => void) | undefined;
    let dead = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      Promise.all([fetch("/music/tracks.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error("tracks")))), import("./rtdeck")])
        .then(([tracks, m]) => m.mountDeck(el, tracks))
        .then((destroy: () => void) => { if (dead) destroy(); else { off = destroy; setState("ready"); } })
        .catch(() => { if (!dead) setState("fail"); });
    }, { rootMargin: "900px 0px" });
    io.observe(el);
    return () => { dead = true; io.disconnect(); off?.(); };
  }, []);

  return (
    <div className="rtd" data-state={state}>
      <div ref={host} className="rtd-host" />
      {state === "wait" && <p className="rtd-wait" role="status"><i aria-hidden="true" />Warming up the deck</p>}
      {state === "fail" && <p className="rtd-wait" role="status">The deck couldn&rsquo;t load here. Try reytek1201.com.</p>}
    </div>
  );
}
