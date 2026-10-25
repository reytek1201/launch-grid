"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { mailBody, mailtoHref, submitInquiry } from "@/lib/inquiry";
import { addDays, dateIssue, partyWord, shortDate, slotsFor, todayIn } from "@/lib/reserve";
import type { SiteData } from "@/lib/types";
import { Moons } from "./Moons";
import { Chips, LABEL, LINE, RequestSent } from "./PaperForm";

const SEATING = ["No preference", "Window booth", "Long communal table", "Bar"];
const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;
const time12ish = (v: string) => { const [h, m] = v.split(":").map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "pm" : "am"}`; };

type Done = { rows: [string, string][]; mail: string };

// A page from the reservation book: when on the left, who on the right.
export function ReserveSlip({ site }: { site: SiteData }) {
  const { maxParty } = site.reservations;
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [party, setParty] = useState(2);
  const [seating, setSeating] = useState(SEATING[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const today = todayIn(site.timezone).date;
  const max = addDays(today, site.reservations.daysAhead);
  // Slots only exist once a date is chosen, so nothing here depends on the clock during server render.
  const issue = useMemo(() => (date ? dateIssue(site, date) : null), [site, date]);
  const slots = useMemo(() => (date ? slotsFor(site, date) : []), [site, date]);
  const nextOpen = useMemo(() => {
    if (!issue) return null;
    for (let i = 1; i <= 14; i++) { const d = addDays(date > today ? date : today, i); if (!dateIssue(site, d)) return d; }
    return null;
  }, [issue, site, date, today]);

  const pick = (d: string) => { setDate(d); setTime(""); setError(""); };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!date || issue) { setError(issue ?? "Choose a date."); return; }
    if (!time) { setError(slots.length ? "Choose a time." : "No times are left that day. Try another date."); return; }
    setError("");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const when = `${shortDate(date)}, ${time12ish(time)}`;
    const summary = `Table for ${party}, ${when}`;
    const lines: [string, string][] = [
      ["Name", get("name")], ["Date", shortDate(date)], ["Time", time12ish(time)], ["Guests", String(party)],
      ["Seating", seating === SEATING[0] ? "" : seating], ["Phone", get("phone")], ["Email", get("email")], ["Notes", get("notes")],
    ];
    setBusy(true);
    await submitInquiry({ kind: "reservation", summary, fields: Object.fromEntries(lines) });
    setBusy(false);
    setDone({
      rows: [["Name", get("name")], ["When", when], ["Guests", partyWord(party)], ...(seating !== SEATING[0] ? [["Seating", seating] as [string, string]] : [])],
      mail: mailtoHref(site.email, `Table request: ${summary}`, mailBody(lines)),
    });
  }

  if (done) {
    return (
      <RequestSent
        heading="Grazie!"
        rows={done.rows}
        note="This is a demo, so nothing was sent. On a live site this request goes straight to the host stand, and we confirm by phone or email."
        mailHref={done.mail}
        telHref={tel(site.phone)}
        onAgain={() => { setDone(null); setTime(""); }}
        againLabel="Make another request"
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4 border-b border-dashed border-espresso/35 pb-3">
        <h2 className="font-hand text-4xl text-terracotta-deep sm:text-5xl">Prenotazione</h2>
        <Moons id="moon-res" className="mb-2 h-2.5 w-auto text-terracotta" />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-0">
        {/* Left: when and how many */}
        <div className="space-y-6 md:border-r md:border-dashed md:border-espresso/30 md:pr-8">
          <label className={LABEL}>
            Date
            <input
              type="date"
              name="date"
              required
              value={date}
              min={today}
              max={max}
              onChange={(e) => pick(e.target.value)}
              suppressHydrationWarning
              aria-describedby="res-date-note"
              className={LINE}
            />
          </label>

          <div>
            <p id="res-party" className="text-sm text-espresso/75">Guests</p>
            <div role="group" aria-labelledby="res-party" className="mt-1 flex items-center gap-4">
              <button type="button" aria-label="One fewer guest" disabled={party <= 1} onClick={() => setParty((p) => Math.max(1, p - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-espresso/40 text-2xl leading-none transition-colors duration-[250ms] hover:border-espresso disabled:opacity-35">−</button>
              <output aria-live="polite" className="min-w-10 text-center font-heading text-3xl">{party}</output>
              <button type="button" aria-label="One more guest" disabled={party >= maxParty} onClick={() => setParty((p) => Math.min(maxParty, p + 1))} className="grid h-11 w-11 place-items-center rounded-full border border-espresso/40 text-2xl leading-none transition-colors duration-[250ms] hover:border-espresso disabled:opacity-35">+</button>
            </div>
            <p className="mt-2 text-sm text-espresso/80">
              {party >= maxParty ? <>Bigger group? <Link href="/events" className="ink text-terracotta-deep">Ask about private events</Link>.</> : `Up to ${maxParty} online. Larger groups, see private events.`}
            </p>
          </div>

          <Chips
            legend="Time"
            name="time"
            required
            value={time}
            onChange={(v) => { setTime(v); setError(""); }}
            options={slots.map((s) => ({ value: s.value, label: s.label }))}
            hint={
              <p id="res-date-note" aria-live="polite">
                {!date && "Choose a date to see the times."}
                {date && issue && (
                  <>
                    {issue}{" "}
                    {nextOpen && <button type="button" onClick={() => pick(nextOpen)} className="ink text-terracotta-deep">Try {shortDate(nextOpen)}</button>}
                  </>
                )}
                {date && !issue && slots.length === 0 && "No times are left that day. Try another date, or call us."}
              </p>
            }
          />

          <label className={LABEL}>
            Seating
            <select name="seating" value={seating} onChange={(e) => setSeating(e.target.value)} className={`${LINE} appearance-none bg-[length:1rem] bg-[right_0.25rem_center] bg-no-repeat pr-6`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%232B1D14' stroke-width='1.5'%3E%3Cpath d='M3 6l5 5 5-5'/%3E%3C/svg%3E\")" }}>
              {SEATING.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        {/* Right: who */}
        <div className="space-y-5 md:pl-8">
          <label className={LABEL}>Name<input required name="name" autoComplete="name" className={LINE} /></label>
          <label className={LABEL}>Email<input required type="email" name="email" autoComplete="email" className={LINE} /></label>
          <label className={LABEL}>Phone (optional)<input type="tel" name="phone" autoComplete="tel" className={LINE} /></label>
          <label className={LABEL}>
            Notes (birthday, allergies, high chair)
            <textarea name="notes" rows={3} className={`${LINE} resize-none`} />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p role="alert" className="min-h-6 text-sm font-semibold text-terracotta-deep">{error}</p>
        <Magnetic>
          <button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-60">{busy ? "Sending…" : "Request this table"}</button>
        </Magnetic>
      </div>
      <p className="mt-4 text-sm text-espresso/75">A request is not a confirmation. We reply by phone or email, usually within the hour while we are open.</p>
    </form>
  );
}
