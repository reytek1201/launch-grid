"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useId, useRef, useState } from "react";

/**
 * Low & Rolling, a demo BBQ food truck (not a real business). Left: the owner's phone. Right: what a fan
 * sees after tapping the link in the truck's Instagram bio. Pick today's spot and the pin drives across the
 * map; set hours; tap an item to 86 it; "Sold out for today" closes the menu. Nothing is saved.
 */

type Spot = { id: string; name: string; area: string; x: number; y: number };
const SPOTS: Spot[] = [
  { id: "a", name: "Edgewood lot", area: "Old Fourth Ward", x: 70, y: 38 },
  { id: "b", name: "Sunday market", area: "Grant Park", x: 76, y: 78 },
  { id: "c", name: "By the trail", area: "West End", x: 22, y: 64 },
];
const MENU = [
  { id: "brisket", name: "Brisket plate", price: "$18" },
  { id: "pork", name: "Pulled pork sandwich", price: "$13" },
  { id: "ribs", name: "Half rack of ribs", price: "$22" },
  { id: "mac", name: "Smoked mac & cheese", price: "$7" },
];
const HOURS = ["11am – 3pm", "4pm – 9pm", "5pm – late"];

export function LowRolling() {
  const reduce = useReducedMotion();
  const ids = useId();
  const [spot, setSpot] = useState(SPOTS[0]);
  const [prev, setPrev] = useState<Spot | null>(null);
  const [hours, setHours] = useState(HOURS[0]);
  const [out, setOut] = useState<Record<string, boolean>>({ ribs: true });
  const [done, setDone] = useState(false);
  const [ping, setPing] = useState(0);
  const [say, setSay] = useState("");
  const fan = useRef<HTMLDivElement>(null);

  const update = (msg: string) => {
    setPing((p) => p + 1);
    setSay(msg);
    const el = fan.current;
    if (el && window.innerWidth < 1024) {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom < 0) el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
  };
  const pickSpot = (s: Spot) => { if (s.id === spot.id) return; setPrev(spot); setSpot(s); update(`Fans now see: parked at ${s.name}, ${s.area}.`); };
  const pickHours = (h: string) => { setHours(h); update(`Fans now see the hours: ${h}.`); };
  const toggle = (id: string) => { const next = !out[id]; setOut((o) => ({ ...o, [id]: next })); update(`${MENU.find((m) => m.id === id)?.name} is ${next ? "sold out" : "back on"}.`); };
  const toggleDone = () => { const next = !done; setDone(next); update(next ? "Sold out for today. Fans see: see you tomorrow." : "Back open. Fans see the menu again."); };

  return (
    <div className="lr-desk">
      {/* owner */}
      <div className="lr-side">
        <p className="lr-cap"><span>The owner&rsquo;s phone</span> <b>Today, in the back office</b></p>
        <div className="fh-phone-wrap">
          <div className="fh-phone lr-phone lr-owner">
            <div className="fh-screen lr-screen">
              <div className="fh-status lr-status" aria-hidden="true"><span>10:52</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
              <div className="lr-top" aria-hidden="true"><Image className="lr-badge-sm" src="/lowrolling/badge-96.webp" alt="" width={24} height={24} /><b>LOW &amp; ROLLING</b><i>Admin</i></div>
              <div className="bs-scroll lr-scroll">
                <fieldset className="lr-set">
                  <legend>Where are you parked today?</legend>
                  {SPOTS.map((s) => (
                    <label key={s.id} className="lr-opt" data-on={s.id === spot.id}>
                      <input type="radio" name={`${ids}-spot`} checked={s.id === spot.id} onChange={() => pickSpot(s)} />
                      <span><b>{s.name}</b><small>{s.area}</small></span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="lr-set">
                  <legend>Hours today</legend>
                  <div className="lr-chips">
                    {HOURS.map((h) => (
                      <label key={h} className="lr-chip" data-on={h === hours}>
                        <input type="radio" name={`${ids}-hours`} checked={h === hours} onChange={() => pickHours(h)} />{h}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="lr-set">
                  <legend>Tap to 86 an item</legend>
                  {MENU.map((m) => (
                    <label key={m.id} className="lr-86" data-out={!!out[m.id]}>
                      <input type="checkbox" checked={!!out[m.id]} onChange={() => toggle(m.id)} />
                      <span>{m.name}</span><em>{out[m.id] ? "86’d" : "On"}</em>
                    </label>
                  ))}
                </fieldset>
                <button type="button" className="lr-done" aria-pressed={done} onClick={toggleDone}>{done ? "Reopen for today" : "Sold out for today"}</button>
              </div>
              <span className="fh-glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* fan */}
      <div ref={fan} className="lr-side">
        <p className="lr-cap"><span>A fan&rsquo;s phone</span> <b>from the link in your bio</b></p>
        <div className="fh-phone-wrap">
          <div className="fh-phone lr-phone lr-fan" role="region" aria-label="Low & Rolling's site, as a fan sees it">
            <div className="fh-screen lr-fan-screen">
              <div className="fh-status lr-fan-status" aria-hidden="true"><span>10:52</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
              <div className="lr-fan-scroll" aria-hidden="true">
                <div className="lr-hero">
                  <span className="lr-truck-art"><Image src="/lowrolling/truck.webp" alt="" fill sizes="340px" /></span>
                  <p className="lr-brand"><Image className="lr-badge" src="/lowrolling/badge-96.webp" alt="" width={36} height={36} />LOW &amp; ROLLING</p>
                  <p className="lr-tag">Barbecue on wheels</p>
                </div>
                <AnimatePresence>{ping ? <motion.span key={ping} className="lr-ping" initial={reduce ? false : { y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>Updated just now</motion.span> : null}</AnimatePresence>
                <div className="lr-today">
                  <p className="lr-k">Today</p>
                  <motion.p key={spot.id} className="lr-where" initial={reduce || !prev ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{spot.name}<small>{spot.area}</small></motion.p>
                  <p className="lr-hours" data-done={done}>{done ? "Sold out · see you tomorrow" : hours}</p>
                </div>
                <div className="lr-map">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path className="lr-park" d="M54 58 C 62 50, 86 52, 92 64 C 96 74, 86 92, 70 90 C 56 88, 46 70, 54 58 Z" />
                    <path className="lr-trail" d="M0 72 C 20 66, 30 70, 44 58 S 70 30, 100 26" />
                    {[18, 38, 58, 82].map((v) => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" />)}
                    {[20, 44, 70, 88].map((v) => <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} />)}
                    {prev ? <motion.path key={`r${spot.id}`} className="lr-route" d={`M${prev.x} ${prev.y} Q ${(prev.x + spot.x) / 2 + 10} ${(prev.y + spot.y) / 2 - 18} ${spot.x} ${spot.y}`} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeInOut" }} /> : null}
                  </svg>
                  <motion.span className="lr-pin" initial={false} animate={{ left: `${spot.x}%`, top: `${spot.y}%` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 14 }}><i /></motion.span>
                  <span className="lr-dir">Get directions</span>
                </div>
                <div className="lr-menu" data-done={done}>
                  <span className="lr-plate"><Image src="/lowrolling/brisket.webp" alt="" fill sizes="320px" /></span>
                  <p className="lr-k">On the pit</p>
                  {MENU.map((m) => (
                    <p key={m.id} className="lr-item" data-out={!!out[m.id]}>
                      <span>{m.name}</span><b>{m.price}</b>
                      <AnimatePresence>{out[m.id] ? <motion.em initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -14 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} exit={{ opacity: 0 }}>Sold out</motion.em> : null}</AnimatePresence>
                    </p>
                  ))}
                  <AnimatePresence>{done ? <motion.p className="lr-closed" initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: -6 }} exit={{ opacity: 0 }}>Sold out<small>See you tomorrow</small></motion.p> : null}</AnimatePresence>
                </div>
                <p className="lr-social"><i /><i /><i /> Follow the smoke</p>
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
