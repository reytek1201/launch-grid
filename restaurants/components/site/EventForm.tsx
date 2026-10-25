"use client";

import { useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { mailBody, mailtoHref, submitInquiry } from "@/lib/inquiry";
import { shortDate } from "@/lib/reserve";
import type { SiteData } from "@/lib/types";
import { Moons } from "./Moons";
import { Chips, LABEL, LINE, RequestSent } from "./PaperForm";
import { useToday } from "./useToday";

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;
type Done = { rows: [string, string][]; mail: string; delivered: boolean };
const NO_PREF = "Not sure yet";

// The inquiry slip for private events: the night first, then who is asking.
export function EventForm({ site }: { site: SiteData }) {
  const events = site.events!;
  const [occasion, setOccasion] = useState("");
  const [space, setSpace] = useState(NO_PREF);
  const [package_, setPackage] = useState(NO_PREF);
  const [flexible, setFlexible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const today = useToday(site.timezone);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const date = flexible ? "Flexible" : get("date") ? shortDate(get("date")) : "";
    const guests = get("guests");
    const summary = `${occasion || "Private event"} for ${guests}${date ? `, ${date}` : ""}`;
    const lines: [string, string][] = [
      ["Name", get("name")], ["Occasion", occasion], ["Guests", guests], ["Date", date],
      ["Space", space === NO_PREF ? "" : space], ["Menu", package_ === NO_PREF ? "" : package_],
      ["Phone", get("phone")], ["Email", get("email")], ["Notes", get("notes")],
    ];
    setBusy(true);
    const { delivered } = await submitInquiry({ kind: "event", summary, fields: Object.fromEntries(lines) });
    setBusy(false);
    setDone({
      rows: [["Name", get("name")], ["Occasion", occasion], ["Guests", guests], ...(date ? [["Date", date] as [string, string]] : [])],
      mail: mailtoHref(site.email, `Private event inquiry: ${summary}`, mailBody(lines)),
      delivered,
    });
  }

  if (done) {
    return (
      <RequestSent
        heading="Grazie mille!"
        rows={done.rows}
        delivered={done.delivered}
        note={
          done.delivered
            ? site.isDemo
              ? "Your inquiry reached our demo inbox. This is a demo restaurant, so nobody will call you back."
              : "Your inquiry is in. Our events host calls you back within one working day."
            : "This is a demo, so nothing was sent. On a live site our events host calls you back within one working day."
        }
        mailHref={done.mail}
        telHref={tel(site.phone)}
        onAgain={() => setDone(null)}
        againLabel="Send another inquiry"
      />
    );
  }

  const select = `${LINE} appearance-none bg-[length:1rem] bg-[right_0.25rem_center] bg-no-repeat pr-6`;
  const arrow = { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%232B1D14' stroke-width='1.5'%3E%3Cpath d='M3 6l5 5 5-5'/%3E%3C/svg%3E\")" };

  return (
    <form onSubmit={onSubmit} className="p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4 border-b border-dashed border-espresso/35 pb-3">
        <h2 id="inquiry-title" className="font-hand text-4xl text-terracotta-deep sm:text-5xl">Tell us the night</h2>
        <Moons id="moon-evt" className="mb-2 h-2.5 w-auto text-terracotta" />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.15fr_1fr] md:gap-0">
        <div className="space-y-6 md:border-r md:border-dashed md:border-espresso/30 md:pr-8">
          <Chips legend="What are we celebrating?" name="occasion" required value={occasion} onChange={setOccasion} options={events.occasions.map((o) => ({ value: o, label: o }))} />
          <div className="grid grid-cols-2 gap-6">
            <label className={LABEL}>Guests<input required type="number" inputMode="numeric" min={2} max={80} name="guests" className={LINE} /></label>
            <label className={LABEL}>
              Date
              <input type="date" name="date" min={today} disabled={flexible} required={!flexible} className={`${LINE} disabled:opacity-40`} />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm text-espresso/85">
            <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="h-5 w-5 rounded-sm border-espresso/50 text-terracotta-deep focus:ring-terracotta-deep" />
            The date is flexible
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className={LABEL}>
              Room
              <select value={space} onChange={(e) => setSpace(e.target.value)} className={select} style={arrow}>
                <option>{NO_PREF}</option>
                {events.spaces.map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className={LABEL}>
              Menu
              <select value={package_} onChange={(e) => setPackage(e.target.value)} className={select} style={arrow}>
                <option>{NO_PREF}</option>
                {events.packages.map((p) => <option key={p.id}>{p.name}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-5 md:pl-8">
          <label className={LABEL}>Name<input required name="name" autoComplete="name" className={LINE} /></label>
          <label className={LABEL}>Email<input required type="email" name="email" autoComplete="email" className={LINE} /></label>
          <label className={LABEL}>Phone<input required type="tel" name="phone" autoComplete="tel" className={LINE} /></label>
          <label className={LABEL}>
            Anything we should know? (dietary needs, a cake, a surprise)
            <textarea name="notes" rows={3} className={`${LINE} resize-none`} />
          </label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Magnetic><button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-60">{busy ? "Sending…" : "Send the inquiry"}</button></Magnetic>
      </div>
      <p className="mt-4 text-sm text-espresso/75">An inquiry is not a booking. We call you back, plan the menu together, and a deposit holds the date.</p>
    </form>
  );
}
