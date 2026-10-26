"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const TITLE = "A band site that doesn’t look like a template.";
const BEAMS = [
  { k: "b1", lamp: 0.16 },  // cyan, Reytek
  { k: "b2", lamp: 0.84 },  // warm clay, Funkharp
  { k: "b3", lamp: 0.5 },   // LaunchGrid cobalt, the follow spot
] as const;

/**
 * Musicians hero: a dark stage. Three spotlights sweep through haze (cyan for Reytek, clay for Funkharp,
 * cobalt follows the pointer), light up the headline where they cross it and pool on the stage floor.
 * A setlist taped to the floor lists the page. Scrolling down converges the beams and dims the rig
 * into the deck below. Positions are written to CSS variables; nothing re-renders.
 */
export function MusiciansHero({ fontClass = "" }: { fontClass?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const title = el.querySelector<HTMLElement>(".mh-title");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, visible = true, px = -1;
    const t0 = performance.now();
    const onMove = (e: PointerEvent) => { if (e.pointerType === "mouse") { const r = el.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; } };
    const onLeave = () => { px = -1; };

    const frame = (now: number) => {
      raf = 0;
      const t = reduce ? 2.2 : (now - t0) / 1000;
      const r = el.getBoundingClientRect(), W = r.width, H = r.height;
      const p = Math.min(1, Math.max(0, -r.top / (H * 0.85)));           // 0 at rest, 1 as the hero leaves
      const tr = title?.getBoundingClientRect();
      const headY = tr ? tr.top - r.top + tr.height * 0.5 : H * 0.4;
      const floorY = H * 0.94;
      // where each beam hits the headline line, as a fraction of the width
      const aim = [
        0.42 + 0.27 * Math.sin(t * 0.52),
        0.58 + 0.27 * Math.sin(t * 0.41 + 2.1),
        px >= 0 ? px : 0.5 + 0.3 * Math.sin(t * 0.33 + 4.2),
      ].map((x) => x + (0.5 - x) * p);
      const s = el.style;
      BEAMS.forEach((b, i) => {
        const lx = b.lamp * W, hx = aim[i] * W;
        const a = Math.atan2(lx - hx, headY);                               // CSS rotate: positive swings the bottom left
        s.setProperty(`--${b.k}a`, `${a.toFixed(4)}rad`);
        const fx = lx - Math.tan(a) * floorY;
        s.setProperty(`--${b.k}f`, `${((fx / W) * 100).toFixed(2)}%`);
        if (tr) { s.setProperty(`--${b.k}x`, `${(hx - (tr.left - r.left)).toFixed(1)}px`); s.setProperty(`--${b.k}y`, `${(tr.height * 0.5).toFixed(1)}px`); }
      });
      s.setProperty("--int", (1 - p * 0.75).toFixed(3));
      s.setProperty("--pulse", reduce ? "0" : (0.5 + 0.5 * Math.cos(t * Math.PI * 4)).toFixed(3));   // 120 bpm
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: "60px" });
    io.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    const onScroll = () => kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    kick();
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={root} className={`mh ${fontClass}`} aria-labelledby="mu-title">
      <div className="mh-rig" aria-hidden="true">
        <span className="mh-truss" />
        {BEAMS.map((b) => <span key={b.k} className={`mh-lamp ${b.k}`} />)}
      </div>
      <div className="mh-beams" aria-hidden="true">
        {BEAMS.map((b) => <span key={b.k} className={`mh-beam ${b.k}`}><i /></span>)}
      </div>
      <div className="mh-haze" aria-hidden="true"><i /><i /></div>
      <div className="mh-floor" aria-hidden="true">
        <span className="mh-boards" />
        {BEAMS.map((b) => <span key={b.k} className={`mh-pool ${b.k}`} />)}
      </div>

      <div className="mh-in">
        <div className="mh-copy">
          <p className="mh-label">
            <span className="mh-meter" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
            For bands and artists
          </p>
          <h1 id="mu-title" className="mh-title">
            <span className="mh-t">{TITLE}</span>
            <span className="mh-glow" aria-hidden="true">{TITLE}</span>
          </h1>
          <p className="mh-sub">Your sound, your look, and a back office on your phone for shows, music, videos and bookings.</p>
          <div className="mh-cta">
            <Link className="btn mh-btn" href="/start?kind=band">Start a band project <span aria-hidden="true">→</span></Link>
            <a className="mh-hear" href="#reytek">Hear it first <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <nav className="mh-setlist" aria-labelledby="mh-sl">
          <span className="mh-tape t1" aria-hidden="true" /><span className="mh-tape t2" aria-hidden="true" />
          <p id="mh-sl" className="mh-sl-head">Setlist <span>tonight</span></p>
          <ol>
            <li><a href="#reytek"><b>Upload a song. The site finds its beat.</b><small>Reytek · the 3D deck</small></a></li>
            <li><a href="#funkharp"><b>Someone writes to book you.</b><small>Funkharp · the booking letter</small></a></li>
          </ol>
          <p className="mh-encore"><a href="/start?kind=band"><span>Encore</span> Start a band project</a></p>
        </nav>
      </div>
    </section>
  );
}
