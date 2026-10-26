"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AdminTop, TabBar } from "./AdminChrome";
import { band } from "./data";

type Show = { id: string; isoDate: string; venue: string; street: string; city: string; photo: number; fresh?: boolean };

const PHOTOS = [
  { src: "/funkharp/stage-yellow.jpg" },
  { src: "/funkharp/crowd.jpg" },
  { src: "/funkharp/stage-neon.jpg" },
];

const fieldClass = "min-h-12 w-full rounded-2xl border border-ink/20 bg-white/70 px-4 text-base text-ink outline-none focus:border-dirt";

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(utc);
  const day = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" }).format(utc);
  return { date: `${month} ${day}`, month, day };
}
const isoIn = (days: number) => { const d = new Date(Date.now() + days * 864e5); return d.toISOString().slice(0, 10); };

/**
 * Backstage. Left: the band's phone on the Funkharp admin Shows screen, with its real "Add a show" form.
 * Right: the band's public Shows page with Funkharp's real show tickets. Add a date on the phone and it
 * prints onto the site; the soonest date becomes the big "Next show" ticket, exactly like their site.
 * Sample dates and venues, nothing is saved.
 */
export function ShowsDesk() {
  const reduce = useReducedMotion();
  const [shows, setShows] = useState<Show[]>(() => [
    { id: "a", isoDate: isoIn(24), venue: "Harbor Room", street: "12 Marine St", city: "St. Augustine, FL 32084", photo: 0 },
    { id: "b", isoDate: isoIn(45), venue: "Porch Sessions", street: "88 Oak Ave", city: "Jacksonville, FL 32204", photo: 1 },
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
    const show: Show = {
      id: `n${Date.now()}`, isoDate: String(f.get("show_date")), venue: String(f.get("venue")).trim(),
      street: String(f.get("street")).trim(), city: String(f.get("city")).trim(), photo: shows.length % PHOTOS.length, fresh: true,
    };
    setSaving(true);
    const wait = reduce ? 0 : 650;
    timers.current.push(window.setTimeout(() => {
      setSaving(false);
      setShows((s) => [...s.map((x) => ({ ...x, fresh: false })), show]);
      setStamp(Date.now());
      const first = [...shows, show].sort((a, b) => a.isoDate.localeCompare(b.isoDate))[0].id === show.id;
      setToast(first ? `Added. ${show.venue} is now the next show on the site.` : `Added. ${show.venue} is on the Shows page.`);
      form.reset();
      const el = site.current;
      if (el && window.innerWidth < 1024) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }, wait));
  };

  return (
    <div className="bs-desk">
      <div className="bs-side">
        <p className="fh-cap"><span className="font-sans">The band&rsquo;s phone</span> <span className="font-display">Shows, in the back office</span></p>
        <div className="fh-phone-wrap">
          <div className="fh-phone bs-phone">
            <div className="fh-screen bg-cloud text-ink">
              <div className="fh-status" aria-hidden="true"><span>9:41</span><span className="fh-island" /><span className="fh-bars"><i /><i /><i /><i /></span></div>
              <div aria-hidden="true"><AdminTop /></div>
              <div className="bs-scroll">
                <p className="font-sans text-[0.65rem] tracking-[0.2em] text-dirt uppercase">Manage</p>
                <p className="mt-0.5 font-display text-3xl leading-none text-ink">Shows</p>
                <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-2xl border border-ink/10 bg-paper p-4" aria-labelledby={`${ids}-t`}>
                  <p id={`${ids}-t`} className="font-display text-2xl leading-none">Add a show</p>
                  <div className="grid gap-1">
                    <label htmlFor={`${ids}-d`} className="font-sans text-sm text-ink">Date</label>
                    <input id={`${ids}-d`} name="show_date" type="date" required defaultValue={isoIn(10)} className={fieldClass} />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={`${ids}-v`} className="font-sans text-sm text-ink">Venue</label>
                    <input id={`${ids}-v`} name="venue" type="text" required maxLength={60} autoComplete="off" className={fieldClass} />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={`${ids}-s`} className="font-sans text-sm text-ink">Street</label>
                    <input id={`${ids}-s`} name="street" type="text" required maxLength={80} autoComplete="off" defaultValue="1 Beach Blvd" className={fieldClass} />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={`${ids}-c`} className="font-sans text-sm text-ink">City</label>
                    <input id={`${ids}-c`} name="city" type="text" required maxLength={80} autoComplete="off" defaultValue="St. Augustine, FL 32080" className={fieldClass} />
                  </div>
                  <button type="submit" disabled={saving} className="min-h-12 w-fit rounded-full bg-[linear-gradient(120deg,var(--dirt),var(--clay))] px-6 font-semibold text-cloud disabled:opacity-60">
                    {saving ? "Saving…" : "Add show"}
                  </button>
                </form>
                <p className="mt-5 font-sans text-xs tracking-[0.16em] text-ink/60 uppercase" aria-hidden="true">On the books <span className="ml-1 text-ink/40">{shows.length}</span></p>
                <ul className="mt-2 grid gap-2 pb-24" aria-hidden="true">
                  {sorted.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper p-2.5">
                      <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl"><Image src={PHOTOS[s.photo].src} alt="" fill sizes="64px" className="object-cover" /></span>
                      <span className="min-w-0">
                        <span className="block font-sans text-[0.65rem] tracking-[0.16em] text-dirt uppercase">{fmt(s.isoDate).date}</span>
                        <span className="block truncate font-display text-lg leading-none">{s.venue}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <AnimatePresence>
                {toast ? (
                  <motion.p key={stamp} className="bs-toast" initial={reduce ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
                    Show added
                  </motion.p>
                ) : null}
              </AnimatePresence>
              <TabBar active="Shows" />
              <span className="fh-glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div ref={site} className="bs-site">
        <div className="bs-browser" aria-label="Funkharp's Shows page, as the public sees it" role="region">
          <div className="bs-chrome" aria-hidden="true"><i /><i /><i /><span>{band.name} · Shows</span><b data-on={stamp > 0}>{stamp ? "Updated just now" : "Live"}</b></div>
          <div className="bs-page bg-cloud text-ink">
            <p className="font-sans text-xs tracking-[0.2em] text-dirt uppercase">Shows</p>
            <p className="mt-1 font-display text-4xl leading-none md:text-5xl">Dates on the books.</p>
            <LayoutGroup>
              <div className="mt-6 grid gap-5">
                <AnimatePresence initial={false} mode="popLayout">
                  {next ? <Ticket key={next.id} show={next} kicker="Next show" tone="active" reduce={!!reduce} /> : null}
                </AnimatePresence>
                {later.length ? <p className="mt-2 font-sans text-xs tracking-[0.2em] text-dirt uppercase">Later</p> : null}
                <AnimatePresence initial={false} mode="popLayout">
                  {later.map((s) => <Ticket key={s.id} show={s} kicker="Later" tone="later" reduce={!!reduce} />)}
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

/** Funkharp's ShowTicket (components/harp/ShowTicket.tsx), sized for this demo. The map popup is left out. */
function Ticket({ show, kicker, tone, reduce }: { show: Show; kicker: string; tone: "active" | "later"; reduce: boolean }) {
  const d = fmt(show.isoDate);
  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? false : show.fresh ? { y: -40, opacity: 0, scale: 0.94, rotate: -1.5 } : false}
      animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      className={`bs-ticket${show.fresh ? " fresh" : ""}`}
    >
      <span className={`flex flex-col overflow-hidden rounded-3xl sm:flex-row ${tone === "later" ? "shadow-[0_24px_50px_rgb(36_48_42/0.28)]" : "shadow-[0_30px_70px_rgb(140_70_50/0.35)]"}`}>
        <span className="relative h-36 shrink-0 overflow-hidden sm:h-auto sm:w-[38%]">
          <Image src={PHOTOS[show.photo].src} alt="" fill sizes="(min-width: 640px) 16rem, 100vw" className="object-cover" />
          <span aria-hidden="true" className={`absolute inset-0 ${tone === "later" ? "bg-[linear-gradient(to_bottom,transparent_25%,#3d4a40_96%)] sm:bg-[linear-gradient(to_right,transparent_18%,#3d4a40_88%)]" : "bg-[linear-gradient(to_bottom,transparent_25%,var(--dirt)_96%)] sm:bg-[linear-gradient(to_right,transparent_18%,var(--dirt)_88%)]"}`} />
        </span>
        <span className={`relative z-10 -mt-12 flex flex-1 text-cloud sm:mt-0 sm:-ml-14 ${tone === "later" ? "bg-[linear-gradient(120deg,#3d4a40_0%,#5c6854_55%,#8d8474_100%)]" : "bg-[linear-gradient(120deg,var(--dirt)_0%,var(--clay)_55%,#d9a071_100%)]"}`}>
          <span className="fh-grain pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <span className="relative flex flex-col items-center justify-center px-4 py-5 sm:px-6">
            <span className="font-sans text-xs tracking-[0.3em] uppercase">{d.month}</span>
            <span className={`font-display leading-none ${tone === "active" ? "text-6xl" : "text-5xl"}`}>{d.day}</span>
          </span>
          <span aria-hidden="true" className="fh-perforation my-4 w-2 shrink-0" />
          <span className="relative flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-6">
            <span className="font-sans text-[0.65rem] tracking-[0.25em] text-cloud/85 uppercase">{kicker}</span>
            <span className={`mt-1.5 block break-words font-display leading-none ${tone === "active" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}>{show.venue}</span>
            <span className="mt-2 font-serif text-base text-cloud/90">{band.name}, live.</span>
            <span className="mt-1 truncate font-sans text-xs text-cloud/80">{show.city}</span>
          </span>
        </span>
      </span>
    </motion.div>
  );
}
