"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from "react";

const CELLS: [number, number][] = [[8, 14], [36, 14], [8, 42], [36, 42], [64, 42], [8, 70], [36, 70], [64, 70]];

export type MarkHandle = { play: () => void; arm: () => void };

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The LaunchGrid mark: eight ink cells and one cobalt cell that has launched up and to the right.
 * `autoplay` runs the lift-off once on mount; `armed` starts with the cell back in its slot (the form uses it).
 */
export function Mark({ label = "LaunchGrid", autoplay = false, armed = false, ref }: { label?: string | null; autoplay?: boolean; armed?: boolean; ref?: Ref<MarkHandle> }) {
  const svg = useRef<SVGSVGElement>(null);

  const play = useCallback(() => {
    const el = svg.current;
    if (!el) return;
    el.classList.remove("armed");
    if (reduced()) return;
    el.classList.remove("go");
    void el.getBoundingClientRect();
    el.classList.add("go");
  }, []);
  const arm = useCallback(() => {
    const el = svg.current;
    if (!el) return;
    el.classList.remove("go");
    el.classList.add("armed");
  }, []);

  useImperativeHandle(ref, () => ({ play, arm }), [play, arm]);

  useEffect(() => {
    if (!autoplay) return;
    const id = requestAnimationFrame(play);
    return () => cancelAnimationFrame(id);
  }, [autoplay, play]);

  return (
    <svg ref={svg} className={`mark${armed ? " armed" : ""}`} viewBox="0 0 104 96" role={label ? "img" : undefined} aria-label={label ?? undefined} aria-hidden={label ? undefined : true} focusable="false">
      <rect className="slot" x="64" y="14" width="22" height="22" rx="3" />
      {CELLS.map(([x, y]) => <rect key={`${x}-${y}`} className="cell" x={x} y={y} width="22" height="22" rx="3" />)}
      <g className="trail"><rect x="85" y="26" width="4" height="8" rx="2" /><rect x="85" y="38" width="4" height="4" rx="2" /></g>
      <g className="lift"><rect x="76" y="0" width="22" height="22" rx="3" /></g>
    </svg>
  );
}

/** The hero mark: plays on load, and again when tapped. */
export function HeroMark() {
  const m = useRef<MarkHandle>(null);
  return (
    <button type="button" className="mark-button" onClick={() => m.current?.play()} aria-label="Play the LaunchGrid lift-off again">
      <Mark ref={m} autoplay label={null} />
    </button>
  );
}
