"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Stop = {
  id: "reytek" | "funkharp" | "cinque" | "keymacro" | "slidepress" | "poesource";
  note?: string;
  kind: string;
  name: string;
  text: string;
  tags: string[];
  screen: string;
  alt: string;
  video?: string;
  link?: { href: string; label: string };
  soon?: string;
};

const STOPS: Stop[] = [
  {
    id: "reytek", kind: "My own artist site", name: "Reytek",
    text: "reytek1201.com opens with sound and a turntable you can scratch and pitch. In its back office I upload a song and the site finds the beat, so the turntable moves in time.",
    tags: ["Turntable", "Beat finder", "Timeline", "Video channel"],
    screen: "/work/reytek-home.webp", alt: "Reytek's artist site on a phone: a dark home screen with the Reytek name and an Enter button",
    video: "/work/reytek-clip.mp4", link: { href: "https://reytek1201.com", label: "Open reytek1201.com" },
  },
  {
    id: "funkharp", kind: "Band client", name: "Funkharp",
    text: "Shows, a booking inbox that alerts the band's phones, a fan list, music and videos. The band changes all of it themselves.",
    tags: ["Shows", "Booking inbox", "Fan list", "Music"],
    screen: "/work/funkharp-home.webp", alt: "Funkharp's band site on a phone: the band name over a cream and teal home screen",
    video: "/work/funkharp-clip.mp4", soon: "Live link soon",
  },
  {
    id: "cinque", kind: "Demo restaurant · not a real business", name: "Trattoria Cinque Lune",
    text: "Menu, specials, hours and reservation requests the owner runs from a phone. It's the template every restaurant site starts from.",
    tags: ["Menu", "Specials", "Reservations", "Photos"],
    screen: "/work/cinque-lune-home.webp", alt: "Trattoria Cinque Lune's site on a phone: a warm candlelit dining room under the restaurant's name",
    video: "/work/cinque-lune-clip.mp4", link: { href: "https://cinque-lune-demo.vercel.app", label: "Open the demo" },
  },
  {
    id: "keymacro", kind: "My own app", name: "KeyMacro",
    text: "Nutrition and training in one place: calories and macros, fasting, Apple Health sync, and Coach Key, a coach you can just text.",
    tags: ["Macros", "Fasting", "Apple Health", "AI coach"],
    screen: "/work/km-today.webp", alt: "KeyMacro's Today screen: calorie, protein, carb and fat rings all in zone, and a fasting timer",
    video: "/work/keymacro-clip.mp4", link: { href: "https://keymacro.fit", label: "Open keymacro.fit" },
  },
  {
    id: "slidepress", kind: "My own app", name: "SlidePress",
    text: "Type an idea, get a slide carousel with a voiceover. Every slide gets an image, a headline and a script you can rewrite, in the voice you pick.",
    tags: ["Slides", "Voiceover", "Rewrite", "Share"],
    screen: "/work/sp-editor.webp", alt: "SlidePress editor: slide 1 of 5 with its image, headline, voiceover script and voice choices",
    video: "/work/slidepress-clip.mp4", link: { href: "https://www.slidepress.co", label: "Open slidepress.co" },
  },
  {
    id: "poesource", kind: "My own web app · full launch Dec 1 with PoE 2 1.0", name: "PoE Source",
    text: "A free hub for Path of Exile players with a real database behind it. Sign in with Google or Discord and your campaign checklist, characters, saved builds, Atlas trees and farming strategies follow you to any device. Players share builds and strategies publicly, like each other's, and check live economy prices.",
    tags: ["Accounts & sync", "Saved builds", "Public shares & likes", "Live economy", "WebGL skill trees"],
    screen: "/work/poe-home.webp", alt: "PoE Source on a phone: the Path of Exile 2 hub with the campaign leveling guide and featured build guides",
    video: "/work/poesource-clip.mp4", link: { href: "https://poe2source.com", label: "Open poe2source.com" },
    note: "Unofficial fan project, not affiliated with Grinding Gear Games.",
  },
];

const QUESTS = ["Defeat the Bloated Miller", "Talk to Renly for a skill gem", "Defeat Beira of the Rotten Pack"];

const RINGS = [["Calories", 2056, 2045], ["Protein", 161, 149], ["Carbs", 175, 182], ["Fat", 77, 80]] as const;

function Signature({ id }: { id: Stop["id"] }) {
  if (id === "reytek") return (
    <div className="yr-sig yr-vinyl" aria-hidden="true">
      <div className="yr-disc"><span className="yr-disc-label">REYTEK</span></div>
      <span className="yr-arm" />
    </div>
  );
  if (id === "funkharp") return (
    <div className="yr-sig yr-band" aria-hidden="true">
      <div className="yr-polaroid"><Image src="/work/funkharp-photo.webp" alt="" fill sizes="160px" /></div>
      <div className="yr-eq">{[0, 1, 2, 3, 4, 5, 6].map((i) => <i key={i} style={{ ["--i" as string]: i }} />)}</div>
    </div>
  );
  if (id === "cinque") return (
    <div className="yr-sig yr-arch" aria-hidden="true">
      <div className="yr-window"><Image src="/work/cinque-lune-door.webp" alt="" fill sizes="200px" /></div>
      <span className="yr-glow" />
    </div>
  );
  if (id === "keymacro") return (
    <div className="yr-sig yr-rings" aria-hidden="true">
      {RINGS.map(([label, val, goal], i) => (
        <div key={label} className="yr-ring" style={{ ["--i" as string]: i, ["--pct" as string]: Math.min(1, val / goal) }}>
          <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" pathLength="100" /><circle className="on" cx="22" cy="22" r="18" pathLength="100" /></svg>
          <b>{val}</b><span>{label}</span>
        </div>
      ))}
    </div>
  );
  if (id === "poesource") return (
    <>
      <div className="yr-sig yr-poe" aria-hidden="true">
        <div className="yr-emblem"><Image src="/work/poe-emblem.webp" alt="" fill sizes="150px" /></div>
      </div>
      <div className="yr-sig yr-quest" aria-hidden="true">
        {QUESTS.map((q, i) => <span key={q} style={{ ["--i" as string]: i }}><i />{q}</span>)}
        <b>Synced</b>
      </div>
    </>
  );
  return (
    <div className="yr-sig yr-deck" aria-hidden="true">
      <div className="yr-slide s3"><b /><b /><i /></div>
      <div className="yr-slide s2"><b /><b /><i /></div>
      <div className="yr-slide s1"><Image src="/work/sp-slide.webp" alt="" fill sizes="140px" /></div>
    </div>
  );
}

/**
 * "One year. Five launches." A cobalt flight path draws down the page as you scroll. Each stop is a real
 * phone that tilts into place with its own small signature (turntable, equalizer, candlelit window,
 * macro rings, a fanned slide deck, a quest list that checks itself off). Scroll position is written to CSS variables, nothing re-renders.
 */
export function YearOfWork() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stops = Array.from(el.querySelectorAll<HTMLElement>(".yr-stop"));
    const rail = el.querySelector<HTMLElement>(".yr-path");
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (rail) {
        const r = rail.getBoundingClientRect();
        rail.style.setProperty("--fill", String(reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height))));
      }
      for (const s of stops) {
        const r = s.getBoundingClientRect();
        const e = reduce ? 1 : Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.62)));
        const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        s.style.setProperty("--e", e.toFixed(3));
        s.style.setProperty("--s", reduce ? "0.5" : t.toFixed(3));
        s.dataset.lit = String(r.top < vh * 0.62);
        const v = s.querySelector<HTMLVideoElement>("video");
        if (v && !reduce) {
          const inView = r.bottom > 0 && r.top < vh && e > 0.6;
          if (inView && v.paused) v.play().catch(() => {});
          else if (!inView && !v.paused) v.pause();
        }
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <section ref={root} className="section yr" id="work" aria-labelledby="yr-title">
      <div className="section-head">
        <span className="label">The past year</span>
        <h2 id="yr-title">One year. Six launches.</h2>
        <p>Everything here I designed and built myself: my own artist site, a band&rsquo;s site, a demo restaurant, and three apps of my own.</p>
      </div>

      <div className="yr-path">
        <span className="yr-rail" aria-hidden="true"><i /><b className="yr-tip" /></span>
        <ol className="yr-list">
          {STOPS.map((s, i) => (
            <li key={s.id} className={`yr-stop yr-${s.id}`} data-side={i % 2 ? "r" : "l"}>
              <span className="yr-node" aria-hidden="true"><i /></span>
              <div className="yr-stage">
                <Signature id={s.id} />
                <div className="yr-phone">
                  <span className="dev-body">
                    <span className="dev-side" aria-hidden="true" />
                    <span className="dev-screen">
                      <Image src={s.screen} alt={s.alt} fill sizes="(min-width: 900px) 220px, 160px" />
                      {s.video && <video className="yr-video" src={s.video} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={(e) => { e.currentTarget.dataset.ready = "true"; }} />}
                      <span className="dev-island" aria-hidden="true" />
                      <span className="dev-glare" aria-hidden="true" />
                    </span>
                  </span>
                </div>
              </div>
              <div className="yr-copy">
                <span className="label">{s.kind}</span>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
                <ul className="yr-tags">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                {s.link && <a className="yr-link" href={s.link.href} target="_blank" rel="noopener">{s.link.label} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}
                {s.soon && <span className="yr-soon">{s.soon}</span>}
                {s.note && <small className="yr-note">{s.note}</small>}
              </div>
            </li>
          ))}
          <li className="yr-stop yr-next" data-side="l">
            <span className="yr-node" aria-hidden="true"><i /></span>
            <div className="yr-copy">
              <span className="label">Next on the grid</span>
              <h3>Yours.</h3>
              <p>The same hands and the same care go into your launch.</p>
              <Link className="btn" href="/start">Start a project</Link>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
