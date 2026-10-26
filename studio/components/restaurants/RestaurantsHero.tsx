"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Restaurants hero: a dining room at night, nearly dark. The pointer (or a finger, or a slow drift on
 * phones) is a candle that lights the room where it goes, with a real flicker. A neon OPEN sign buzzes
 * on, and a chalkboard of tonight's specials lists the page. Positions are CSS variables; one rAF loop
 * that stops off-screen; static for reduced motion.
 */
export function RestaurantsHero({ fontClass = "" }: { fontClass?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, visible = true, tx = -1, ty = -1, x = 0.62, y = 0.42, last = performance.now(), held = 0;
    const t0 = last;
    const setTarget = (cx: number, cy: number) => { const r = el.getBoundingClientRect(); tx = (cx - r.left) / r.width; ty = (cy - r.top) / r.height; held = performance.now(); };
    const onMove = (e: PointerEvent) => setTarget(e.clientX, e.clientY);
    const onLeave = () => { tx = -1; };
    const frame = (now: number) => {
      raf = 0;
      const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      const idle = tx < 0 || now - held > 4000;
      // with no pointer, the candle wanders the table
      const gx = idle ? 0.55 + 0.22 * Math.sin(t * 0.21) : tx;
      const gy = idle ? 0.45 + 0.12 * Math.sin(t * 0.33 + 1.3) : ty;
      const k = 1 - Math.exp(-dt * (idle ? 1.2 : 9));
      x += (gx - x) * k; y += (gy - y) * k;
      // candle flicker: a few sines, never twitchy
      const fl = reduce ? 1 : 1 + 0.035 * Math.sin(t * 9.1) + 0.025 * Math.sin(t * 13.7 + 2) + 0.02 * Math.sin(t * 23.3);
      el.style.setProperty("--cx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--cy", `${(y * 100).toFixed(2)}%`);
      el.style.setProperty("--fl", fl.toFixed(3));
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: "40px" });
    io.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onMove);
    el.addEventListener("pointerleave", onLeave);
    kick();
    return () => { cancelAnimationFrame(raf); io.disconnect(); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerdown", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, []);

  return (
    <section ref={root} className={`rh ${fontClass}`} aria-labelledby="rh-title">
      <div className="rh-room" aria-hidden="true">
        <Image src="/restaurants/cl-room.webp" alt="" fill priority sizes="100vw" />
      </div>
      <div className="rh-dark" aria-hidden="true" />
      <div className="rh-warm" aria-hidden="true" />
      <span className="rh-flame" aria-hidden="true"><i /></span>

      <div className="rh-sign" aria-hidden="true">
        <span className="rh-chain l" /><span className="rh-chain r" />
        <span className="rh-neon">{"OPEN".split("").map((c, i) => <b key={i} style={{ ["--i" as string]: i }}>{c}</b>)}</span>
      </div>

      <div className="rh-in">
        <div className="rh-copy">
          <p className="rh-label">For restaurants, cafés and food trucks</p>
          <h1 id="rh-title" className="rh-title">Your restaurant, open on every phone.</h1>
          <p className="rh-sub">A site that feels like your place, and a back office for the menu, specials, hours and reservations, right on your phone.</p>
          <div className="rh-cta">
            <Link className="btn rh-btn" href="/start?kind=restaurant">Start a restaurant project <span aria-hidden="true">→</span></Link>
            <a className="rh-seat" href="#cinque">Take a seat <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <nav className="rh-board" aria-labelledby="rh-board-h">
          <p id="rh-board-h" className="rh-board-h">Tonight</p>
          <ol>
            <li><a href="#cinque"><b>A meal, in scroll</b><small>Cinque Lune · trattoria</small></a></li>
            <li><a href="#truck"><b>Where we&rsquo;re parked today</b><small>Low &amp; Rolling · BBQ truck</small></a></li>
            <li><a href="#cafe"><b>Sold out of cinnamon rolls</b><small>Sparrow &amp; Skillet · brunch café</small></a></li>
          </ol>
          <p className="rh-dessert"><a href="/start?kind=restaurant"><span>Dessert</span> Start a restaurant project</a></p>
        </nav>
      </div>
    </section>
  );
}
