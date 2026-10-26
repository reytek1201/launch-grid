"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

/**
 * Backstage, as Kaeso Vance (a demo artist, not a real person). Left: his phone on the Shows screen of his
 * back office. Right: the Tour page of his site, with flyer-style tickets. Add a date and the flyer prints
 * onto the site; the soonest date becomes the headliner. Sample dates and venues, nothing is saved.
 */

type Show = { id: string; isoDate: string; venue: string; city: string; art: number; fresh?: boolean };

const ARTIST = "Kaeso Vance";
const ART = ["/kaeso/flyer-skyline.webp", "/kaeso/flyer-mic.webp", "/kaeso/flyer-chrome.webp"];

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { ...o, timeZone: "UTC" }).format(utc);
  return { date: `${f({ month: "short" })} ${f({ day: "numeric" })}`, month: f({ month: "short" }).toUpperCase(), day: f({ day: "numeric" }), dow: f({ weekday: "short" }).toUpperCase() };
}
const isoIn = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);

export function KaesoDesk() {
  const reduce = useReducedMotion();
  const [shows, setShows] = useState<Show[]>(() => [
    { id: "a", isoDate: isoIn(21), venue: "Vault 404", city: "Atlanta, GA", art: 0 },
    { id: "b", isoDate: isoIn(38), venue: "Eastline Hall", city: "Charlotte, NC", art: 1 },
  ]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [stamp, setStamp] = useState(0);
  const site = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const ids = useId();
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const sorted = [...shows].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const [next, ...later] = sorted;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const show: Show = { id: `n${Date.now()}`, isoDate: String(f.get("show_date")), venue: String(f.get("venue")).trim(), city: String(f.get("city")).trim(), art: shows.length % 3, fresh: true };
    setSaving(true);
    timers.current.push(window.setTimeout(() => {
      setSaving(false);
      setShows((s) => [...s.map((x) => ({ ...x, fresh: false })), show]);
      setStamp(Date.now());
      const first = [...shows, show].sort((a, b) => a.isoDate.localeCompare(b.isoDate))[0].id === show.id;
      setToast(first ? `Added. ${show.venue} is now the headliner on the Tour page.` : `Added. ${show.venue} is on the Tour page.`);
      form.reset();
      const el = site.current;
      if (el && window.innerWidth < 1024) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 0 : 650));
  };

  return (
    <div className="bs-desk kv-desk">
      <div className="bs-side">
        <p className="kv-cap"><span>His phone</span> <b>Shows, in the back office</b></p>
        <div className="fh-phone-wrap">
          <div className="fh-phone bs-phone kv-phone">
            <div className="fh-screen kv-screen">
              <div className="fh-status kv-status" aria-hidden="true"><span>9:41</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
              <div className="kv-top" aria-hidden="true"><Image className="kv-top-mark" src="/kaeso/kaeso-emblem-160.webp" alt="" width={22} height={22} /><b>KAESO VANCE</b><span>Admin</span><i>Site</i></div>
              <div className="bs-scroll kv-scroll">
                <p className="kv-over">Manage</p>
                <p className="kv-h">Shows</p>
                <form onSubmit={onSubmit} className="kv-form" aria-labelledby={`${ids}-t`}>
                  <p id={`${ids}-t`} className="kv-form-h">Add a show</p>
                  <label htmlFor={`${ids}-d`}>Date</label>
                  <input id={`${ids}-d`} name="show_date" type="date" required defaultValue={isoIn(9)} />
                  <label htmlFor={`${ids}-v`}>Venue</label>
                  <input id={`${ids}-v`} name="venue" type="text" required maxLength={40} autoComplete="off" />
                  <label htmlFor={`${ids}-c`}>City</label>
                  <input id={`${ids}-c`} name="city" type="text" required maxLength={40} autoComplete="off" defaultValue="Atlanta, GA" />
                  <button type="submit" disabled={saving}>{saving ? "Saving…" : "Add show"}</button>
                </form>
                <p className="kv-over kv-books" aria-hidden="true">On the books <span>{shows.length}</span></p>
                <ul className="kv-rows" aria-hidden="true">
                  {sorted.map((s) => (
                    <li key={s.id}><span className="kv-thumb"><Image src={ART[s.art]} alt="" fill sizes="54px" /></span><span><i>{fmt(s.isoDate).date}</i><b>{s.venue}</b></span></li>
                  ))}
                </ul>
              </div>
              <AnimatePresence>
                {toast ? <motion.p key={stamp} className="bs-toast kv-toast" initial={reduce ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">Show added</motion.p> : null}
              </AnimatePresence>
              <KvTabs />
              <span className="fh-glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div ref={site} className="bs-site">
        <div className="bs-browser kv-browser" aria-label={`${ARTIST}'s Tour page, as fans see it`} role="region">
          <div className="bs-chrome kv-chrome" aria-hidden="true"><i /><i /><i /><span>{ARTIST} · Tour</span><b data-on={stamp > 0}>{stamp ? "Updated just now" : "Live"}</b></div>
          <div className="kv-page">
            <Image className="kv-watermark" src="/kaeso/kaeso-emblem-512.webp" alt="" width={512} height={512} aria-hidden="true" />
            <div className="kv-banner" aria-hidden="true"><Image src="/kaeso/silhouette.webp" alt="" fill sizes="(min-width: 1024px) 760px, 100vw" /></div>
            <div className="kv-brand">
              <Image className="kv-mark" src="/kaeso/kaeso-emblem-160.webp" alt="" width={160} height={160} />
              <p className="kv-word" aria-hidden="true">KAESO VANCE</p>
            </div>
            <p className="kv-title">On the road.</p>
            <LayoutGroup>
              <div className="kv-list">
                <AnimatePresence initial={false} mode="popLayout">
                  {next ? <Flyer key={next.id} show={next} head reduce={!!reduce} /> : null}
                </AnimatePresence>
                {later.length ? <p className="kv-over kv-later">Also on the road</p> : null}
                <AnimatePresence initial={false} mode="popLayout">
                  {later.map((s) => <Flyer key={s.id} show={s} reduce={!!reduce} />)}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{toast}</p>
      </div>
    </div>
  );
}

function Flyer({ show, head = false, reduce }: { show: Show; head?: boolean; reduce: boolean }) {
  const d = fmt(show.isoDate);
  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? false : show.fresh ? { y: -46, opacity: 0, rotate: -3, scale: 0.94 } : false}
      animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 150, damping: 17 }}
      className={`kv-flyer art-${show.art}${head ? " head" : ""}${show.fresh ? " fresh" : ""}`}
    >
      <span className="kv-art" aria-hidden="true"><Image src={ART[show.art]} alt="" fill sizes="(min-width: 640px) 280px, 100vw" /><i /></span>
      <span className="kv-date"><small>{d.dow}</small><strong>{d.day}</strong><small>{d.month}</small></span>
      <span className="kv-info">
        <span className="kv-k">{head ? "Next up" : "Live"}</span>
        <span className="kv-venue">{show.venue}</span>
        <span className="kv-city">{show.city}</span>
      </span>
      <span className="kv-tix" aria-hidden="true">Tickets</span>
    </motion.div>
  );
}

function KvTabs() {
  const tabs: [string, ReactNode][] = [
    ["Shows", <path key="s" d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM12 7v10" />],
    ["Drops", <path key="d" d="M12 3v12M7 10l5 5 5-5M5 21h14" />],
    ["Merch", <path key="m" d="M8 4 4 7l2 3 2-1v11h8V9l2 1 2-3-4-3a4 4 0 0 1-8 0z" />],
    ["Fans", <path key="f" d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6.5 6.5 0 0 1 3.5 6" />],
    ["Inbox", <path key="i" d="M3 13h5l2 3h4l2-3h5v6H3zM3 13 6 4h12l3 9" />],
  ];
  return (
    <div className="kv-tabs" aria-hidden="true">
      {tabs.map(([label, d]) => (
        <span key={label} className={label === "Shows" ? "on" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
          {label}
        </span>
      ))}
    </div>
  );
}
