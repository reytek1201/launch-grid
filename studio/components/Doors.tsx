"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const DOORS = [
  { kind: "band", title: "Bands and artists", text: "Shows, music, videos, a booking inbox and your fan list.", go: "Start a band project" },
  { kind: "restaurant", title: "Restaurants", text: "Menu, specials, hours, reservations and photos you change yourself.", go: "Start a restaurant project" },
  { kind: "other", title: "Other small businesses", text: "The same build and back office, shaped to what you sell. I’ll reply with the nearest fit.", go: "Tell me what you run" },
] as const;

function Room({ kind }: { kind: (typeof DOORS)[number]["kind"] }) {
  if (kind === "band") return (
    <span className="dr-room dr-room-band">
      <Image src="/work/funkharp-photo.webp" alt="" fill sizes="(min-width: 760px) 300px, 90vw" />
      <i className="dr-beam b1" /><i className="dr-beam b2" />
      <span className="dr-eq">{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
    </span>
  );
  if (kind === "restaurant") return (
    <span className="dr-room dr-room-rest">
      <Image src="/work/cinque-lune-door.webp" alt="" fill sizes="(min-width: 760px) 300px, 90vw" />
      <i className="dr-candle" />
    </span>
  );
  return (
    <span className="dr-room dr-room-other">
      <span className="dr-grid">{Array.from({ length: 9 }, (_, i) => <i key={i} className={i === 2 ? "lift" : undefined} />)}</span>
    </span>
  );
}

function Panel({ kind }: { kind: (typeof DOORS)[number]["kind"] }) {
  return (
    <span className={`dr-panel dr-panel-${kind}`}>
      {kind === "band" && <><span className="dr-stencil">Stage door</span><span className="dr-bar" /></>}
      {kind === "restaurant" && <><span className="dr-inset" /><span className="dr-inset" /><span className="dr-sign">Open</span></>}
      {kind === "other" && <><span className="dr-draw" /><span className="dr-dim w">W 36 in</span><span className="dr-dim h">H 80 in</span><span className="dr-stamp">Your business</span></>}
      <span className="dr-knob" />
    </span>
  );
}

/** "Pick your door." Three real doors, each opening onto its own world. They open on hover, and on phones as each one reaches the middle of the screen. */
export function Doors() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const doors = Array.from(el.querySelectorAll<HTMLElement>(".dr"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.target as HTMLElement).dataset.open = String(e.isIntersecting);
    }, { rootMargin: "-38% 0px -38% 0px" });
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) (e.target as HTMLElement).dataset.seen = "true";
    }, { threshold: 0.35 });
    doors.forEach((d) => { io.observe(d); seen.observe(d); });
    return () => { io.disconnect(); seen.disconnect(); };
  }, []);

  return (
    <div ref={root} className="grid3 doors">
      {DOORS.map((d, i) => (
        <Link key={d.kind} className={`dr dr-${d.kind}`} href={`/start?kind=${d.kind}`} style={{ ["--i" as string]: i }}>
          <span className="dr-frame" aria-hidden="true">
            <Room kind={d.kind} />
            <span className="dr-spill" />
            <Panel kind={d.kind} />
          </span>
          <div className="dr-copy">
            <h3>{d.title}</h3>
            <p>{d.text}</p>
            <span className="go">{d.go} →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
