"use client";

import { useEffect, useRef, useState } from "react";

const BEATS = [
  { t: "T−4 · Brief", title: "Your material arrives.", text: "Photos, the menu or the shows, the look you want. All in writing." },
  { t: "T−3 · Proposal", title: "A plan with a price and a date.", text: "A fixed price and a launch date in writing, before work starts." },
  { t: "T−2 · Build", title: "The pieces come together.", text: "The site and the back office you'll run from your phone." },
  { t: "T−1 · Check", title: "Every piece gets checked.", text: "Phone first, accessibility checked, a full launch check." },
  { t: "T−0 · Launch", title: "Live on your domain.", text: "You get a handover guide for the back office." },
];

// [label, side note, top %, left %, width %, height %, scatter x, scatter y, tilt, style]
const PIECES: [string, string, number, number, number, number, string, string, string, string][] = [
  ["Your name", "☰", 3, 5, 90, 7, "-70px", "-60px", "-6deg", ""],
  ["", "", 12, 5, 90, 25, "90px", "-30px", "5deg", "hero-img"],
  ["Next show · Sat", "Tickets", 40, 5, 90, 9, "-100px", "10px", "4deg", ""],
  ["Menu · Specials", "Today", 52, 5, 90, 9, "95px", "40px", "-5deg", ""],
  ["Photos", "", 64, 5, 43, 13, "-80px", "70px", "-8deg", ""],
  ["Hours", "", 64, 52, 43, 13, "80px", "90px", "7deg", ""],
  ["Book or reserve", "", 81, 5, 90, 9, "0px", "120px", "-3deg", "btnp"],
];

/** Five beats on native scroll: a site's pieces assemble inside a pinned phone, then the phone lifts off. */
export function LaunchSequence() {
  const section = useRef<HTMLElement>(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      setBeat(Math.min(4, Math.floor(p * 5)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} className="seq" aria-labelledby="seq-title">
      <h2 id="seq-title" className="sr-only">How a launch runs, in five steps</h2>
      <ol className="sr-only">
        {BEATS.map((b) => <li key={b.t}>{b.t.split(" · ")[1]}: {b.title} {b.text}</li>)}
      </ol>
      <div className="stage" data-beat={beat} aria-hidden="true">
        <div className="stage-top">
          <span className="label">Launch sequence · keep scrolling</span>
          <span className="ticks">{BEATS.map((b, i) => <i key={b.t} className={i <= beat ? "on" : undefined} />)}</span>
        </div>
        <div className="stage-body">
          <ol className="log">
            {BEATS.map((b, i) => (
              <li key={b.t} className={i === beat ? "cur" : i > beat ? "fut" : undefined}>
                <span className="t">{b.t}</span><b>{b.title}</b><span>{b.text}</span>
              </li>
            ))}
          </ol>
          <div className="rig">
            <div className="phone">
              <div className="scr">
                <div className="scan" />
                {PIECES.map(([label, sub, top, left, w, h, dx, dy, r, cls], i) => {
                  const pos = { top: `${top}%`, left: `${left}%`, width: `${w}%`, height: `${h}%` };
                  return (
                    <div key={i} style={{ display: "contents" }}>
                      <div className="slotbox" style={pos} />
                      <div className={`piece ${cls}`} style={{ ...pos, ["--dx" as string]: dx, ["--dy" as string]: dy, ["--r" as string]: r, ["--d" as string]: `${i * 0.06}s` }}>
                        {label && <span>{label}</span>}
                        {sub && <span className="sub">{sub}</span>}
                        <span className="chk">✓</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <span className="live">LIVE</span>
            <span className="trailbar" /><span className="trailbar b2" />
          </div>
        </div>
      </div>
    </section>
  );
}
