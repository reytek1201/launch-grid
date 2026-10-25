"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Device = { slug: string; name: string; kind: string; src: string; href: string; alt: string };

const DEVICES: Device[] = [
  { slug: "funkharp", name: "Funkharp", kind: "Band", src: "/work/funkharp-home.webp", href: "#work", alt: "Funkharp's home page on a phone: St. Augustine, FL, the band name in script, Hear the singles and Shows buttons, and a photo of a harmonica on piano keys" },
  { slug: "reytek", name: "Reytek", kind: "My artist site", src: "/work/reytek-home.webp", href: "https://reytek1201.com/?ref=launchgrid", alt: "Reytek's home page on a phone: a dark screen with a ring of small text, the name REYTEK, and Enter with sound and Enter silent buttons" },
  { slug: "cinque-lune", name: "Cinque Lune", kind: "Demo restaurant", src: "/work/cinque-lune-home.webp", href: "https://cinque-lune-demo.vercel.app", alt: "Trattoria Cinque Lune's home page on a phone: a brick corner restaurant at dusk, a specials banner, and Reserve a table and See the menu buttons" },
];

const COUNT = ["T−3", "T−2", "T−1", "Lift-off", "All three live"];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The home hero. Three real sites stand on the launch grid as phones with depth. On load the grid draws in,
 * a countdown runs and the phones lift off the grid one by one. The stage then follows the pointer (desktop)
 * or the scroll (phone) with a small tilt. Reduced motion: everything in its final place, no tilt.
 */
export function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "go" | "done">("idle");
  const [count, setCount] = useState(COUNT.length - 1);

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
      el.style.setProperty("--glare", `${(50 + x * 4).toFixed(1)}%`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 14;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 8;
      kick();
    };
    const onLeave = () => { tx = 0; ty = 0; kick(); };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(-1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight));
      tx = p * 16; ty = p * -6; kick();
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

      <div className="hx-stage" ref={stage}>
        <div className="hx-count label" aria-hidden="true"><i />{COUNT[count]}</div>
        <div className="hx-floor" aria-hidden="true"><div className="hx-grid" /><div className="hx-pad" /></div>
        <div className="hx-rig">
          {DEVICES.map((d, i) => (
            <a key={d.slug} href={d.href} className={`dev dev-${i}`} style={{ ["--i" as string]: i }} {...(d.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} aria-label={`${d.name}, ${d.kind.toLowerCase()}${d.href.startsWith("http") ? ", opens in a new tab" : ""}`}>
              <span className="dev-body">
                <span className="dev-side" aria-hidden="true" />
                <span className="dev-btn dev-btn-a" aria-hidden="true" /><span className="dev-btn dev-btn-b" aria-hidden="true" /><span className="dev-btn dev-btn-c" aria-hidden="true" />
                <span className="dev-screen">
                  <Image src={d.src} alt={d.alt} fill sizes="(max-width: 760px) 200px, 260px" priority={i === 1} />
                  <span className="dev-island" aria-hidden="true" />
                  <span className="dev-glare" aria-hidden="true" />
                </span>
              </span>
              <span className="dev-shadow" aria-hidden="true" />
              <span className="dev-trail" aria-hidden="true" />
            </a>
          ))}
        </div>
        <ul className="hx-tags" aria-label="Sites on the grid">
          {DEVICES.map((d) => <li key={d.slug}><b>{d.name}</b><span>{d.kind}</span></li>)}
          <li className="hx-next"><Link href="/start"><b>Yours</b><span>Next on the grid</span></Link></li>
        </ul>
      </div>
    </section>
  );
}
