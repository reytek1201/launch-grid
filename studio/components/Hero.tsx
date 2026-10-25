"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Device = { slug: string; name: string; kind: string; src: string; href: string; alt: string; video?: string };

const DEVICES: Device[] = [
  { slug: "funkharp", name: "Funkharp", kind: "Band", src: "/work/funkharp-home.webp", href: "#work", alt: "Funkharp's home page on a phone: St. Augustine, FL, the band name in script, Hear the singles and Shows buttons, and a photo of a harmonica on piano keys", video: "/work/funkharp-clip.mp4" },
  { slug: "reytek", name: "Reytek", kind: "My artist site", src: "/work/reytek-home.webp", href: "https://reytek1201.com/?ref=launchgrid", alt: "Reytek's home page on a phone: a black-and-white portrait inside a glowing cyan ring, wrapped in swirling light trails, with the name REYTEK below", video: "/work/reytek-clip.mp4" },
  { slug: "cinque-lune", name: "Cinque Lune", kind: "Demo restaurant", src: "/work/cinque-lune-home.webp", href: "https://cinque-lune-demo.vercel.app", alt: "Trattoria Cinque Lune's home page on a phone: a brick restaurant entrance with warm light in the doorway, an Open until 9 pm sign, and Reserve a table and See the menu buttons", video: "/work/cinque-lune-clip.mp4" },
];

const COUNT = ["T−3", "T−2", "T−1", "Lift-off", "All three live"];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ScreenVideo({ src, active, hovered }: { src: string; active: boolean; hovered: boolean }) {
  const v = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [ending, setEnding] = useState(false);
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const el = v.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const play = active && seen && (!fine || hovered);
    if (play && !reduced()) { el.play().catch(() => {}); }
    else { el.pause(); }
  }, [active, hovered, seen]);
  return <video ref={v} className="dev-video" data-ready={ready} data-ending={ending} src={src} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}
    onPlaying={() => setReady(true)} onPause={() => { setReady(false); setEnding(false); }}
    onTimeUpdate={(e) => { const t = e.currentTarget; setEnding(t.duration - t.currentTime < 0.45); }} />;
}

/**
 * The home hero. Three real sites stand on the launch grid as phones with depth. On load the grid draws in,
 * a countdown runs and the phones lift off the grid one by one. The stage then follows the pointer (desktop)
 * or the scroll (phone) with a small tilt. Reduced motion: everything in its final place, no tilt.
 */
export function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "go" | "done">("idle");
  const [count, setCount] = useState(COUNT.length - 1);
  const [front, setFront] = useState(1); // Reytek in front by default
  const [hover, setHover] = useState(-1);
  const [used, setUsed] = useState(false);
  const swiped = useRef(false);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const go = (n: number) => { setUsed(true); setFront(((n % DEVICES.length) + DEVICES.length) % DEVICES.length); };

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    if (reduced()) { at(0, () => { setPhase("done"); setCount(COUNT.length - 1); }); return () => timers.forEach(clearTimeout); }
    at(0, () => { setPhase("go"); setCount(0); });
    at(450, () => setCount(1));
    at(900, () => setCount(2));
    at(1350, () => setCount(3));
    at(2700, () => { setCount(4); setPhase("done"); });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Tilt: pointer on desktop, scroll on touch. Eased in one rAF loop that stops when settled.
  useEffect(() => {
    const el = stage.current;
    if (!el || reduced()) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      el.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
      el.style.setProperty("--glare", `${(50 + x * 10).toFixed(1)}%`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 3.2;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 1.8;
      kick();
    };
    const onLeave = () => { tx = 0; ty = 0; kick(); };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(-1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight));
      tx = p * 3.5; ty = p * -1.5; kick();
    };
    if (fine) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hx" data-phase={phase} aria-labelledby="hero-title">
      <div className="hx-copy">
        <span className="label hx-eyebrow">A year of building · Atlanta</span>
        <h1 id="hero-title" className="hx-title">
          <span className="hx-line"><span>A website you run</span></span>{" "}
          <span className="hx-line"><span>from your <em>phone.</em></span></span>
        </h1>
        <p className="lede hx-lede">I build custom sites for bands, restaurants and small businesses, with a back office you run from your phone. Everything happens in writing.</p>
        <div className="row hx-cta">
          <Link className="btn" href="/start">Start a project</Link>
          <a className="btn btn-ghost" href="#back-office">Try the back office</a>
        </div>
      </div>

      <div className="hx-stage" ref={stage} data-used={used} role="group" aria-roledescription="carousel" aria-label="Sites built with LaunchGrid. Swipe or use the arrow keys to choose one." tabIndex={0}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); go(front - 1); } if (e.key === "ArrowRight") { e.preventDefault(); go(front + 1); } }}
        onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; }}
        onPointerUp={(e) => {
          const d = drag.current; drag.current = null;
          if (!d) return;
          const dx = e.clientX - d.x, dy = e.clientY - d.y;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(front + (dx < 0 ? 1 : -1)); d.moved = true; drag.current = null; swiped.current = true; setTimeout(() => { swiped.current = false; }, 50); }
        }}
        onPointerCancel={() => { drag.current = null; }}>
        <div className="hx-count label" aria-hidden="true"><i />{COUNT[count]}</div>
        <div className="hx-floor" aria-hidden="true"><div className="hx-grid" /><div className="hx-pad" /></div>
        <button type="button" className="hx-arrow hx-prev" aria-label="Previous site" onClick={() => go(front - 1)}><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <button type="button" className="hx-arrow hx-next" aria-label="Next site" onClick={() => go(front + 1)}><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        <div className="hx-rig">
          {DEVICES.map((d, i) => {
            const pos = (["c", "r", "l"] as const)[(i - front + DEVICES.length) % DEVICES.length];
            const isFront = pos === "c";
            const ext = d.href.startsWith("http");
            return (
            <a key={d.slug} href={d.href} draggable={false} onDragStart={(e) => e.preventDefault()} data-pos={pos} className={`dev dev-${i}`} style={{ ["--i" as string]: i }}
              {...(isFront && ext ? { target: "_blank", rel: "noopener" } : {})}
              aria-label={isFront ? `${d.name}, ${d.kind.toLowerCase()}${ext ? ", opens in a new tab" : ""}` : `Show ${d.name} in front`}
              aria-current={isFront ? "true" : undefined}
              onClick={(e) => { if (swiped.current || !isFront) { e.preventDefault(); if (!isFront && !swiped.current) go(i); } }}
              onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(-1)}>
              <span className="dev-body">
                <span className="dev-side" aria-hidden="true" />
                <span className="dev-btn dev-btn-a" aria-hidden="true" /><span className="dev-btn dev-btn-b" aria-hidden="true" /><span className="dev-btn dev-btn-c" aria-hidden="true" />
                <span className="dev-screen">
                  <Image src={d.src} alt={d.alt} fill sizes="(max-width: 760px) 200px, 260px" priority={i === 1} draggable={false} />
                  {d.video && <ScreenVideo src={d.video} active={isFront && phase === "done"} hovered={hover === i} />}
                  <span className="dev-island" aria-hidden="true" />
                  <span className="dev-glare" aria-hidden="true" />
                </span>
              </span>
              <span className="dev-shadow" aria-hidden="true" />
              <span className="dev-trail" aria-hidden="true" />
            </a>
            );
          })}
        </div>
        <ul className="hx-tags" aria-label="Sites on the grid">
          {DEVICES.map((d, i) => <li key={d.slug}><button type="button" aria-pressed={front === i} onClick={() => go(i)}><b>{d.name}</b><span>{d.kind}</span></button></li>)}
          <li className="hx-next"><Link href="/start"><b>Yours</b><span>Next on the grid</span></Link></li>
        </ul>
      </div>
    </section>
  );
}
