"use client";

import "./sketch-man.css";
import { useEffect, useRef } from "react";

const MASK = {
  stand: "/funkharp/sketch-man-harp.svg",
  harp: "/funkharp/sketch-man-harp.svg",
} as const;

function useDrawIn(box: React.RefObject<HTMLElement | null>, figure: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const slot = box.current;
    const man = figure.current;
    if (!slot || !man) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    man.classList.add("armed");
    const finish = () => {
      man.classList.add("drawn");
      man.classList.remove("armed", "go");
    };
    man.addEventListener("animationend", finish);
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          man.classList.add("go");
          watch.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    watch.observe(slot);
    return () => {
      man.removeEventListener("animationend", finish);
      watch.disconnect();
    };
  }, []);
}

export function SketchMan({
  pose = "stand",
  follow = false,
  playing = false,
  className = "",
}: {
  pose?: "stand" | "harp";
  follow?: boolean;
  playing?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const figure = useRef<HTMLSpanElement>(null);
  useDrawIn(box, figure);

  return (
    <span ref={box} className={`sketch-slot ${className}${follow && playing ? " playing" : ""}`} aria-hidden="true">
      {follow ? (
        <span ref={figure} className="sketch-poses draw">
          <span className="sketch-man sketch-p-stand" />
          <span className="sketch-man sketch-p-play" />
        </span>
      ) : (
        <span
          ref={figure}
          className="sketch-man draw"
          style={{
            WebkitMaskImage: `url(${MASK[pose]})`,
            maskImage: `url(${MASK[pose]})`,
          }}
        />
      )}
    </span>
  );
}
