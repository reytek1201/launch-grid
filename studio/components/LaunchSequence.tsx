"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Kind = "restaurant" | "band" | "other";

const BEATS = [
  { t: "T−4", step: "Brief", title: "You tell me what you run.", text: "A few lines in writing. Photos and words come later." },
  { t: "T−3", step: "Proposal", title: "A plan with a price and a date.", text: "What's included, a fixed price and a launch date, in writing before work starts." },
  { t: "T−2", step: "Build", title: "The pieces come together.", text: "Your site and the back office you'll run from your phone." },
  { t: "T−1", step: "Check", title: "Every piece gets checked.", text: "Phone first, accessibility checked, a full launch check." },
  { t: "T−0", step: "Launch", title: "Lift-off.", text: "Live on your domain, with a guide to your back office." },
];

const KIND_LABEL: Record<Kind, string> = { restaurant: "Restaurant", band: "Band or artist", other: "Other business" };
const DEFAULT_NAME: Record<Kind, string> = { restaurant: "Trattoria Cinque Lune", band: "Your Band", other: "Your Shop" };
const BRIEF: Record<Kind, (n: string) => string> = {
  restaurant: (n) => `Hi! We're ${n}. We want our menu, hours and reservations on a site we can change from our phones.`,
  band: (n) => `Hey, we're ${n}. We need our shows, our music and a booking inbox, all run from our phones.`,
  other: (n) => `I run ${n}. I need a site that shows what we do and takes inquiries, and I want to update it myself.`,
};
const SCOPE: Record<Kind, string[]> = {
  restaurant: ["Menu, specials and hours you change", "Reservation requests to your inbox", "Photo gallery", "Back office on your phone"],
  band: ["Shows with ticket links", "Music player", "Booking inbox and fan list", "Back office on your phone"],
  other: ["Pages for what you offer", "Inquiries to your inbox", "Photo gallery", "Back office on your phone"],
};
const CHECKS = ["Fits a 390 px phone screen", "No sideways scroll", "Zero accessibility errors", "Every photo described", "Back office: you're signed in", "Launch check passed"];

// the site pieces, top-to-bottom: [id, top %, height %, scatter x, scatter y, tilt]
const SLOTS: [string, number, number, string, string, string][] = [
  ["nav", 0, 12, "-60px", "-70px", "-8deg"],
  ["photo", 12, 27, "110px", "-40px", "7deg"],
  ["title", 40, 13, "-120px", "0px", "-5deg"],
  ["list", 55, 21, "120px", "30px", "6deg"],
  ["cta", 78, 8, "-90px", "80px", "-7deg"],
  ["tabs", 90, 10, "40px", "110px", "4deg"],
];
const WIRE: Record<Kind, Record<string, string>> = {
  restaurant: { nav: "Name · call", photo: "Dining room photo", title: "Name · hours", list: "Menu", cta: "Reserve", tabs: "Tabs" },
  band: { nav: "Name · links", photo: "Band photo", title: "Name · hometown", list: "Shows", cta: "Hear the singles", tabs: "Tabs" },
  other: { nav: "Name · menu", photo: "Hero photo", title: "What you do", list: "Services", cta: "Send an inquiry", tabs: "Footer" },
};

const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "yourname";

function Piece({ id, kind, name }: { id: string; kind: Kind; name: string }) {
  if (kind === "restaurant") {
    if (id === "nav") return <div className="sp-nav r"><span>{name}</span><i className="sp-call" /></div>;
    if (id === "photo") return <div className="sp-photo"><Image src="/work/cinque-lune-door.webp" alt="" fill sizes="240px" /></div>;
    if (id === "title") return <div className="sp-title r"><b>{name}</b><span>Open tonight · 5 to 10 PM</span></div>;
    if (id === "list") return <div className="sp-list r">{[["Cacio e pepe", "18"], ["Branzino al forno", "29"], ["Tiramisù", "11"]].map(([a, b]) => <div key={a}><span>{a}</span><span>{b}</span></div>)}</div>;
    if (id === "cta") return <div className="sp-cta r">Reserve a table</div>;
    return <div className="sp-tabs r"><i /><i /><b /><i /><i /></div>;
  }
  if (kind === "band") {
    if (id === "nav") return <div className="sp-nav b"><span>{name}</span><span className="sp-dots"><i /><i /><i /></span></div>;
    if (id === "photo") return <div className="sp-photo pol"><Image src="/work/funkharp-photo.webp" alt="" fill sizes="240px" /></div>;
    if (id === "title") return <div className="sp-title b"><span>Hometown, USA</span><b>{name}</b></div>;
    if (id === "list") return <div className="sp-list b">{[["Fri, Nov 6", "Tickets"], ["Sat, Nov 21", "Tickets"]].map(([a, b]) => <div key={a}><span>{a}<small>Sample venue</small></span><em>{b}</em></div>)}</div>;
    if (id === "cta") return <div className="sp-cta b">Hear the singles</div>;
    return <div className="sp-tabs b"><i /><i /><i /><i /><i /></div>;
  }
  if (id === "nav") return <div className="sp-nav o"><span>{name}</span><span className="sp-burger"><i /><i /></span></div>;
  if (id === "photo") return <div className="sp-photo o"><span className="sp-mark" /></div>;
  if (id === "title") return <div className="sp-title o"><b>{name}</b><span>Made here. Run by people you know.</span></div>;
  if (id === "list") return <div className="sp-list o">{["What we offer", "How it works", "Prices"].map((a) => <div key={a}><span>{a}</span><span>→</span></div>)}</div>;
  if (id === "cta") return <div className="sp-cta o">Send an inquiry</div>;
  return <div className="sp-tabs o"><i /><i /><i /></div>;
}

/**
 * The launch sequence, pinned for one long scroll on a dark "mission control" panel.
 * The visitor picks what they run and types its name; the site that builds inside the phone is theirs.
 * Beats: Brief, Proposal, Build, Check, Launch. Everything is driven by scroll position, so it plays backwards too.
 * Nothing typed here is saved; the last card hands the name to the Start a project form.
 */
export function LaunchSequence() {
  const section = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [kind, setKind] = useState<Kind>("restaurant");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setP(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const beat = Math.min(4, Math.floor(p * 5));
  const sub = Math.min(1, p * 5 - beat);
  const name = typed.trim() || DEFAULT_NAME[kind];
  const brief = BRIEF[kind](name);
  const briefShown = beat > 0 ? brief : brief.slice(0, Math.ceil(brief.length * Math.min(1, 0.25 + sub * 2)));
  const placed = beat < 2 ? 0 : beat > 2 ? SLOTS.length : Math.floor(Math.min(1, sub * 1.3) * SLOTS.length + 0.001);
  const ticks = beat < 3 ? 0 : beat > 3 ? CHECKS.length : Math.floor(Math.min(1, sub * 1.25) * CHECKS.length + 0.001);
  const startHref = `/start?kind=${kind}${typed.trim() ? `&business=${encodeURIComponent(typed.trim())}` : ""}`;

  return (
    <section ref={section} className="seq" aria-labelledby="seq-title">
      <h2 id="seq-title" className="sr-only">How a launch runs, in five steps</h2>
      <ol className="sr-only">
        {BEATS.map((b) => <li key={b.t}>{b.step}: {b.title} {b.text}</li>)}
      </ol>
      <div className="stage mc" data-beat={beat} data-kind={kind}>
        <div className="mc-top" aria-hidden="true">
          <span className="label">Launch sequence · {beat < 4 ? "keep scrolling" : "lift-off"}</span>
          <span className="mc-ticks">{BEATS.map((b, i) => <i key={b.t} style={{ ["--f" as string]: i < beat ? 1 : i === beat ? sub : 0 }} />)}</span>
          <span className="mc-t">{BEATS[beat].t}</span>
        </div>

        <div className="mc-body">
          <ol className="mc-log" aria-hidden="true">
            {BEATS.map((b, i) => (
              <li key={b.t} className={i === beat ? "cur" : i < beat ? "done" : undefined}>
                <span className="t">{b.t} · {b.step}</span><b>{b.title}</b><span>{b.text}</span>
              </li>
            ))}
          </ol>

          <div className="mc-rig" aria-hidden="true">
            <div className="mc-floor"><i /></div>
            <div className="mc-phone">
              <div className="mc-screen">
                <span className="ph-island" />
                {SLOTS.map(([id, top, h, dx, dy, r], i) => (
                  <div key={id} className={`mc-slot${i < placed ? " in" : ""}${beat >= 1 ? " labelled" : ""}`} style={{ top: `${top}%`, height: `${h}%`, ["--dx" as string]: dx, ["--dy" as string]: dy, ["--r" as string]: r }}>
                    <span className="mc-wire">{WIRE[kind][id]}</span>
                    <div className="mc-piece"><Piece id={id} kind={kind} name={name} /></div>
                    {i < ticks && <span className="mc-ok">✓</span>}
                  </div>
                ))}
                <span className="mc-scan" />
              </div>
            </div>
            <span className="mc-trail" /><span className="mc-trail t2" />
            <span className="mc-url">{slug(name)}.com · live</span>
          </div>

          <div className="mc-cards">
            <div className="mc-card" data-on={beat === 0} inert={beat !== 0}>
              <span className="label">T−4 · Brief</span>
              <h3>What are we launching?</h3>
              <div className="mc-kinds" role="group" aria-label="What you run">
                {(Object.keys(KIND_LABEL) as Kind[]).map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k]}</button>)}
              </div>
              <label className="mc-name"><span>Its name</span><input value={typed} maxLength={40} placeholder={DEFAULT_NAME[kind]} onChange={(e) => setTyped(e.target.value)} autoComplete="organization" /></label>
              <p className="mc-msg"><small>Your brief</small>{briefShown}<i className="mc-caret" /></p>
            </div>

            <div className="mc-card" data-on={beat === 1} inert={beat !== 1}>
              <span className="label">T−3 · Proposal</span>
              <h3>Proposal for {name}</h3>
              <ul className="mc-scope">{SCOPE[kind].map((s) => <li key={s}>{s}</li>)}</ul>
              <div className="mc-terms"><span>Price</span><b>Fixed, in writing</b><span>Launch date</span><b>In writing</b></div>
              {beat === 1 && sub > 0.45 && <span className="mc-agreed">Agreed</span>}
            </div>

            <div className="mc-card" data-on={beat === 2} inert={beat !== 2}>
              <span className="label">T−2 · Build</span>
              <h3>Building {name}</h3>
              <ul className="mc-build">{SLOTS.map(([id], i) => <li key={id} className={i < placed ? "ok" : undefined}><span>{i < placed ? "✓" : "·"}</span>{WIRE[kind][id]}</li>)}</ul>
              <p className="mc-note">Plus the back office you&rsquo;ll run from your phone.</p>
            </div>

            <div className="mc-card" data-on={beat === 3} inert={beat !== 3}>
              <span className="label">T−1 · Check</span>
              <h3>Launch check</h3>
              <ul className="mc-checks">{CHECKS.map((c, i) => <li key={c} className={i < ticks ? "ok" : undefined}><span>{i < ticks ? "✓" : ""}</span>{c}</li>)}</ul>
            </div>

            <div className="mc-card" data-on={beat === 4} inert={beat !== 4}>
              <span className="label">T−0 · Launch</span>
              <h3>{name} is live.</h3>
              <span className="mc-url-card">{slug(name)}.com · live</span>
              <p>That&rsquo;s the whole run: brief, proposal, build, check, launch. All in writing.</p>
              <p className="mc-next">Yours is next on the grid.</p>
              <Link className="btn" href={startHref}>Start {typed.trim() ? `${name}’s` : "your"} project</Link>
              <span className="mc-fine">Sample only. Nothing you typed here is saved.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
