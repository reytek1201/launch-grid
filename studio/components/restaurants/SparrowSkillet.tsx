"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useId, useRef, useState, type FormEvent } from "react";

/**
 * Sparrow & Skillet, a demo brunch café (not a real business). Left: the café's site. Right: the owner's
 * phone with today's board: the current wait, the special on the chalkboard, and the pastry case where one
 * tap marks something sold out. Everything updates on the site at once. Nothing is saved.
 */

const CASE = [
  { id: "rolls", name: "Cinnamon rolls", note: "Cream cheese icing", img: "rolls", alt: "A tray of iced cinnamon rolls" },
  { id: "pancakes", name: "Buttermilk pancakes", note: "Berries, maple", img: "pancakes", alt: "A stack of pancakes with berries and syrup" },
  { id: "benedict", name: "Salmon Benedict", note: "Smoked salmon, hollandaise", img: "benedict", alt: "Eggs Benedict with smoked salmon and hollandaise" },
  { id: "avo", name: "Avocado toast", note: "Poached egg, radish", img: "avotoast", alt: "Avocado toast topped with a poached egg and radish" },
];
const SPECIAL = "Lemon ricotta pancakes with warm blueberry compote";

export function SparrowSkillet() {
  const reduce = useReducedMotion();
  const ids = useId();
  const [wait, setWait] = useState(25);
  const [special, setSpecial] = useState(SPECIAL);
  const [chalkKey, setChalkKey] = useState(0);
  const [out, setOut] = useState<Record<string, boolean>>({});
  const [say, setSay] = useState("");
  const site = useRef<HTMLDivElement>(null);

  const bring = () => {
    const el = site.current;
    if (!el || window.innerWidth >= 1024) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight * 0.5) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };
  const waitText = (w: number) => (w === 0 ? "No wait. Walk right in." : `About ${w} minutes`);
  const onWait = (w: number) => { setWait(w); setSay(`The site now says the wait is ${waitText(w)}`); };
  const onSpecial = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("special") ?? "").trim();
    if (!v) return;
    setSpecial(v); setChalkKey((k) => k + 1); setSay(`Today's special is on the chalkboard: ${v}`); bring();
  };
  const toggle = (id: string) => {
    const next = !out[id];
    setOut((o) => ({ ...o, [id]: next }));
    setSay(`${CASE.find((c) => c.id === id)?.name} ${next ? "marked sold out on the site" : "back on the site"}`);
    if (next) bring();
  };

  return (
    <div className="ss-desk">
      {/* the café's site */}
      <div ref={site} className="ss-site">
        <p className="ss-cap"><span>The café&rsquo;s site</span> <b>what the morning crowd sees</b></p>
        <div className="ss-browser" role="region" aria-label="Sparrow & Skillet's site">
          <div className="ss-chrome" aria-hidden="true"><i /><i /><i /><span>Sparrow &amp; Skillet</span></div>
          <div className="ss-page">
            <div className="ss-hero"><Image src="/sparrow/cafe.webp" alt="Inside the café: morning sun across marble tables and a pastry counter" fill sizes="(min-width: 1024px) 760px, 100vw" /></div>
            <div className="ss-id">
              <span className="ss-mark" aria-hidden="true"><Image src="/sparrow/emblem-160.webp" alt="" fill sizes="64px" /></span>
              <div>
                <p className="ss-name" aria-hidden="true">Sparrow &amp; Skillet</p>
                <p className="ss-hours">Open 7am – 2pm · brunch all day</p>
              </div>
            </div>
            <div className="ss-wait" data-zero={wait === 0}>
              <span className="ss-clock" style={{ ["--w" as string]: wait / 60 }} aria-hidden="true" />
              <span><small>Wait right now</small><motion.b key={wait} initial={reduce ? false : { y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{waitText(wait)}</motion.b></span>
            </div>
            <div className="ss-board">
              <p className="ss-board-h">Today&rsquo;s special</p>
              <motion.p key={chalkKey} className="ss-chalk" initial={reduce || chalkKey === 0 ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1.4, ease: "easeInOut" }}>{special}</motion.p>
            </div>
            <p className="ss-k">Going fast this morning</p>
            <ul className="ss-case">
              {CASE.map((c) => (
                <li key={c.id} data-out={!!out[c.id]}>
                  <span className="ss-art"><Image src={`/sparrow/${c.img}.webp`} alt={c.alt} fill sizes="(min-width: 640px) 180px, 45vw" /></span>
                  <b>{c.name}</b><small>{c.note}</small>
                  <AnimatePresence>{out[c.id] ? <motion.em initial={reduce ? false : { scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>Sold out</motion.em> : null}</AnimatePresence>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* the owner's phone */}
      <div className="ss-side">
        <p className="ss-cap"><span>The owner&rsquo;s phone</span> <b>today&rsquo;s board</b></p>
        <div className="fh-phone-wrap">
          <div className="fh-phone ss-phone">
            <div className="fh-screen ss-screen">
              <div className="fh-status ss-status" aria-hidden="true"><span>8:14</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
              <div className="ss-top" aria-hidden="true"><span className="ss-mark sm"><Image src="/sparrow/emblem-64.webp" alt="" fill sizes="24px" /></span><b>Sparrow &amp; Skillet</b><i>Admin</i></div>
              <div className="bs-scroll ss-scroll">
                <div className="ss-set">
                  <label htmlFor={`${ids}-w`}>Wait right now <output htmlFor={`${ids}-w`}>{wait === 0 ? "None" : `${wait} min`}</output></label>
                  <input id={`${ids}-w`} type="range" min={0} max={60} step={5} value={wait} onChange={(e) => onWait(Number(e.target.value))} />
                </div>
                <form className="ss-set" onSubmit={onSpecial}>
                  <label htmlFor={`${ids}-s`}>Today&rsquo;s special</label>
                  <textarea id={`${ids}-s`} name="special" rows={3} maxLength={90} defaultValue={SPECIAL} />
                  <button type="submit">Write it on the board</button>
                </form>
                <fieldset className="ss-set">
                  <legend>Going fast · tap when it&rsquo;s gone</legend>
                  {CASE.map((c) => (
                    <label key={c.id} className="ss-86" data-out={!!out[c.id]}>
                      <input type="checkbox" checked={!!out[c.id]} onChange={() => toggle(c.id)} />
                      <span>{c.name}</span><em>{out[c.id] ? "Sold out" : "Still here"}</em>
                    </label>
                  ))}
                </fieldset>
              </div>
              <span className="fh-glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{say}</p>
    </div>
  );
}
