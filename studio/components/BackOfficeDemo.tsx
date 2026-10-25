"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Dish = { n: string; p: string; out: boolean };
type Show = { d: string; v: string; out: boolean };
type S = { dishes: Dish[]; closed: boolean; special: string; shows: Show[] };
type Fn = (s: S) => S;

const INIT: S = {
  dishes: [
    { n: "Cacio e pepe", p: "18", out: false },
    { n: "Branzino al forno", p: "29", out: false },
    { n: "Tiramisù", p: "11", out: false },
  ],
  closed: false,
  special: "",
  shows: [
    { d: "Fri, Nov 6", v: "Sample venue", out: false },
    { d: "Sat, Nov 21", v: "Sample venue", out: true },
  ],
};

const when = (d: string) => { const t = Date.parse(`${d.replace(/^[A-Za-z]+,\s*/, "")} 2026`); return Number.isNaN(t) ? Infinity : t; };
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function Switch({ on, label, onChange, src }: { on: boolean; label: string; onChange: (v: boolean) => void; src: string }) {
  return <button data-src={src} type="button" className="sw" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
}

/**
 * The back of the house. Left: the owner's back office. Right: the live site.
 * A change in the back office lifts off as the logo's cobalt cell, flies to the exact line it changes and lands there.
 * Until a visitor touches it, a ghost finger runs the demo by itself. Reduced motion: plain, instant changes.
 * Everything lives in this component's state; nothing is saved.
 */
export function BackOfficeDemo() {
  const [mode, setMode] = useState<"tr" | "fh">("tr");
  const [bo, setBo] = useState<S>(INIT);
  const [live, setLive] = useState<S>(INIT);
  const [draft, setDraft] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [toast, setToast] = useState(0);
  const [inView, setInView] = useState(false);
  const [auto, setAuto] = useState(false);
  const [banText, setBanText] = useState("");

  const root = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const stopped = useRef(false);
  const visible = useRef(false);
  const gpos = useRef<[number, number] | null>(null);
  const q = (attr: "src" | "dst", id: string) => root.current?.querySelector<HTMLElement>(`[data-${attr}="${id}"]`) ?? null;

  const center = (el: HTMLElement) => {
    const r = root.current!.getBoundingClientRect(), b = el.getBoundingClientRect();
    return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top] as const;
  };

  /** The lift-off: a cobalt cell (plus two fading copies as its trail) arcs from the control to its line on the site. */
  const fly = async (from: string, to: string) => {
    const a = q("src", from), b = q("dst", to);
    if (!root.current || !a || !b || reduced()) return;
    const [x0, y0] = center(a), [x1, y1] = center(b);
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
    let nx = (-dy / len) * 80, ny = (dx / len) * 80;
    if (Math.abs(dx) > Math.abs(dy) ? ny > 0 : nx < 0) { nx = -nx; ny = -ny; }
    const mx = (x0 + x1) / 2 + nx, my = (y0 + y1) / 2 + ny;
    const cells = [1, 0.45, 0.2].map((o, i) => {
      const el = document.createElement("span");
      el.className = "fly";
      root.current!.appendChild(el);
      const anim = el.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(.4) rotate(0deg)`, opacity: 0 },
        { offset: 0.14, transform: `translate(${x0}px, ${y0 - 18}px) scale(1) rotate(0deg)`, opacity: o },
        { offset: 0.55, transform: `translate(${mx}px, ${my}px) scale(${1.3 - i * 0.2}) rotate(45deg)`, opacity: o },
        { transform: `translate(${x1}px, ${y1}px) scale(.7) rotate(90deg)`, opacity: o },
      ], { duration: 860, delay: i * 45, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
      return { el, anim };
    });
    await cells[0].anim.finished.catch(() => {});
    cells.forEach(({ el }) => setTimeout(() => el.remove(), 120));
    const ring = document.createElement("span");
    ring.className = "land-ring";
    root.current.appendChild(ring);
    ring.animate([{ transform: `translate(${x1}px, ${y1}px) scale(.3)`, opacity: 1 }, { transform: `translate(${x1}px, ${y1}px) scale(2.4)`, opacity: 0 }], { duration: 650, easing: "ease-out" }).finished.then(() => ring.remove(), () => ring.remove());
    b.animate([{ boxShadow: "0 0 0 2px rgba(123,144,255,.9), 0 0 24px rgba(123,144,255,.6)" }, { boxShadow: "0 0 0 2px rgba(123,144,255,0), 0 0 24px rgba(123,144,255,0)" }], { duration: 900, easing: "ease-out" });
  };

  /** Apply a change: the back office updates now, the site updates when the cell lands. */
  const commit = (from: string, to: string, fn: Fn) => {
    setBo(fn);
    fly(from, to).then(() => { setLive(fn); setToast((t) => t + 1); });
  };

  const toggleDish = (i: number, v: boolean) => commit(`d${i}`, `d${i}`, (s) => ({ ...s, dishes: s.dishes.map((x, j) => (j === i ? { ...x, out: v } : x)) }));
  const toggleClosed = (v: boolean) => commit("closed", "sign", (s) => ({ ...s, closed: v }));
  const post = (text: string) => { const t = text.trim(); if (!t) return; setBanText(t); commit("post", "ban", (s) => ({ ...s, special: t })); };
  const clear = () => { setDraft(""); commit("clear", "ban", (s) => ({ ...s, special: "" })); };
  const toggleShow = (i: number, v: boolean) => commit(`s${i}`, `s${i}`, (s) => ({ ...s, shows: s.shows.map((x, j) => (j === i ? { ...x, out: v } : x)) }));
  const addShow = () => {
    const d = newDate.trim(); if (!d) return;
    const show = { d, v: newVenue.trim() || "Sample venue", out: false };
    setNewDate(""); setNewVenue("");
    commit("add", "shows", (s) => ({ ...s, shows: [...s.shows, show].sort((a, b) => when(a.d) - when(b.d)).slice(-3) }));
  };

  // the ghost finger
  const moveGhost = async (id: string) => {
    const g = ghost.current, el = q("src", id);
    if (!g || !el || !root.current) return;
    // bring the control into view inside the phone's own scroll first
    const box = el.closest<HTMLElement>(".bo-body");
    if (box) {
      const br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
      const d = er.bottom > br.bottom - 56 ? er.bottom - br.bottom + 64 : er.top < br.top ? er.top - br.top - 8 : 0;
      if (d) { box.scrollBy({ top: d, behavior: "smooth" }); await sleep(420); }
    }
    const [x, y] = center(el);
    const [fx, fy] = gpos.current ?? [x + 60, y + 90];
    gpos.current = [x, y];
    await g.animate([{ transform: `translate(${fx}px, ${fy}px)`, opacity: 1 }, { transform: `translate(${x}px, ${y}px)`, opacity: 1 }], { duration: 650, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }).finished.catch(() => {});
    await g.animate([{ transform: `translate(${x}px, ${y}px) scale(1)` }, { transform: `translate(${x}px, ${y}px) scale(.72)` }, { transform: `translate(${x}px, ${y}px) scale(1)` }], { duration: 260, fill: "forwards" }).finished.catch(() => {});
  };
  const hideGhost = () => { const g = ghost.current; if (g && gpos.current) { const [x, y] = gpos.current; g.animate([{ transform: `translate(${x}px, ${y}px)`, opacity: 1 }, { transform: `translate(${x + 30}px, ${y + 50}px)`, opacity: 0 }], { duration: 400, fill: "forwards" }); } gpos.current = null; };

  const live_ = useRef({ toggleDish, post, clear, setDraft });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { live_.current = { toggleDish, post, clear, setDraft }; });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; if (e.isIntersecting) setInView(true); }, { threshold: 0.45 });
    io.observe(el);
    const stop = (e: Event) => { if (e.isTrusted && !stopped.current) { stopped.current = true; setAuto(false); hideGhost(); } };
    el.addEventListener("pointerdown", stop);
    el.addEventListener("keydown", stop);
    let gone = false;
    const step = async (fn: () => Promise<void> | void) => {
      while (!gone && !stopped.current && !visible.current) await sleep(300);
      if (gone || stopped.current) throw new Error("stop");
      await fn();
    };
    (async () => {
      if (reduced()) return;
      try {
        while (true) {
          await step(() => sleep(900));
          setAuto(true);
          await step(() => moveGhost("d1"));
          await step(() => live_.current.toggleDish(1, true));
          await step(() => sleep(1700));
          await step(() => moveGhost("special"));
          for (const [i] of [..."Truffle risotto tonight"].entries()) await step(async () => { live_.current.setDraft("Truffle risotto tonight".slice(0, i + 1)); await sleep(45); });
          await step(() => moveGhost("post"));
          await step(() => live_.current.post("Truffle risotto tonight"));
          await step(() => sleep(2600));
          await step(() => moveGhost("d1"));
          await step(() => live_.current.toggleDish(1, false));
          await step(() => sleep(1200));
          await step(() => moveGhost("clear"));
          await step(() => live_.current.clear());
          await step(() => { hideGhost(); return sleep(2600); });
        }
      } catch { /* stopped */ }
    })();
    return () => { gone = true; io.disconnect(); el.removeEventListener("pointerdown", stop); el.removeEventListener("keydown", stop); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // gentle parallax on desktop
  useEffect(() => {
    const el = root.current;
    if (!el || reduced() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      el.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    };
    const onLeave = () => { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); };
  }, []);

  return (
    <>
      <div className="boh-top">
        <div className="tabs" role="tablist" aria-label="Sample business">
          <button type="button" role="tab" id="t-tr" className="tab" aria-selected={mode === "tr"} aria-controls="demo" onClick={() => setMode("tr")}>Restaurant</button>
          <button type="button" role="tab" id="t-fh" className="tab" aria-selected={mode === "fh"} aria-controls="demo" onClick={() => setMode("fh")}>Band</button>
        </div>
        <span className="boh-auto label" data-on={auto} aria-hidden="true"><i />Playing by itself · tap anything to take over</span>
      </div>

      <div className="boh" id="demo" ref={root} role="tabpanel" aria-labelledby={mode === "tr" ? "t-tr" : "t-fh"} data-in={inView}>
        <figure className="boh-col boh-back">
          <div className="ph ph-dark">
            <div className="ph-screen">
              <span className="ph-island" aria-hidden="true" />
              <div className="bo-bar"><span className="bo-dot" aria-hidden="true" /><span className="bo-t1">Back office · </span>{mode === "tr" ? "Tonight" : "Shows"}<span className="bo-me" aria-hidden="true">YOU</span></div>
              <div className="bo-body">
                {mode === "tr" ? (
                  <>
                    <div className="bo-h">Sold out tonight</div>
                    {bo.dishes.map((d, i) => (
                      <div className="ctl" key={d.n}>
                        <span>{d.n}</span>
                        <Switch src={`d${i}`} on={d.out} label={`${d.n} sold out`} onChange={(v) => toggleDish(i, v)} />
                      </div>
                    ))}
                    <div className="ctl"><span>Closed today</span><Switch src={"closed"} on={bo.closed} label="Closed today" onChange={toggleClosed} /></div>
                    <div className="field">
                      <label htmlFor="demo-special">Specials banner</label>
                      <div className="inline">
                        <input data-src={"special"} id="demo-special" value={draft} maxLength={40} placeholder="Truffle risotto tonight" onChange={(e) => setDraft(e.target.value)} />
                        <button data-src={"post"} type="button" className="btn btn-sm" onClick={() => post(draft)}>Post</button>
                      </div>
                      <button data-src={"clear"} type="button" className="bo-link" onClick={clear}>Clear the banner</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bo-h">Sold out</div>
                    {bo.shows.map((s, i) => (
                      <div className="ctl" key={`${s.d}-${s.v}`}>
                        <span>{s.d}</span>
                        <Switch src={`s${i}`} on={s.out} label={`${s.d} sold out`} onChange={(v) => toggleShow(i, v)} />
                      </div>
                    ))}
                    <div className="field">
                      <label htmlFor="demo-date">Add a show</label>
                      <input id="demo-date" value={newDate} maxLength={24} placeholder="Sat, Dec 5" onChange={(e) => setNewDate(e.target.value)} />
                      <div className="inline">
                        <input aria-label="Venue" value={newVenue} maxLength={30} placeholder="Venue" onChange={(e) => setNewVenue(e.target.value)} />
                        <button data-src={"add"} type="button" className="btn btn-sm" onClick={addShow}>Add</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {toast > 0 && <div key={toast} className="bo-toast" aria-hidden="true">✓ Saved · live on your site</div>}
            </div>
          </div>
          <figcaption><b>Your back office</b><span>Tap a switch</span></figcaption>
        </figure>

        <figure className="boh-col boh-site">
          <div className="ph">
            <div className="ph-screen">
              <span className="ph-island" aria-hidden="true" />
              <div className={`pv ${mode}`} aria-live="polite">
                {mode === "tr" ? (
                  <>
                    <div className="pv-photo">
                      <Image src="/work/cinque-lune-door.webp" alt="" fill sizes="270px" />
                      <div data-dst={"sign"} className={`sign${live.closed ? " shut" : ""}`} aria-hidden="true">
                        <span className="sign-card"><span className="sign-f">Aperto</span><span className="sign-b">Chiuso</span></span>
                      </div>
                    </div>
                    <div data-dst={"ban"} className={`ban-wrap${live.special ? " on" : ""}`}><div><div className="ban">Tonight: {banText}</div></div></div>
                    <div className="pv-body">
                      <div className="nm-site">Trattoria Cinque Lune</div>
                      <div className={`hrs${live.closed ? " shut" : ""}`}>{live.closed ? "Closed today. See you tomorrow." : "Open tonight · 5 to 10 PM"}</div>
                      {live.dishes.map((d, i) => (
                        <div data-dst={`d${i}`} key={d.n} className={`dish${d.out ? " out" : ""}`}><span className="nm">{d.n}</span><span>{d.out ? <span className="pill stamp">Sold out</span> : d.p}</span></div>
                      ))}
                    </div>
                    <div className="pv-nav" aria-hidden="true"><i /><i /><b /><i /><i /></div>
                  </>
                ) : (
                  <div className="pv-body">
                    <div className="loc">St. Augustine, FL</div>
                    <div className="nm-site">Funkharp</div>
                    <div className="pv-photo-sm"><Image src="/work/funkharp-photo.webp" alt="" fill sizes="200px" /></div>
                    <div className="sh-h">Dates on the books</div>
                    <div data-dst={"shows"} className="show-list">
                      {live.shows.map((s, i) => (
                        <div data-dst={`s${i}`} key={`${s.d}-${s.v}`} className="show"><div>{s.d}<small>{s.v}</small></div>{s.out ? <span className="tk so stamp">Sold out</span> : <span className="tk">Tickets</span>}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <figcaption><b>Your site</b><span>{mode === "tr" ? "Demo restaurant · not a real business" : "Sample dates"}</span></figcaption>
        </figure>
        <span ref={ghost} className="ghost" aria-hidden="true" />
      </div>
      <p className="muted boh-note">Working sample · nothing is saved</p>
    </>
  );
}
