import { requireAdmin } from "@/lib/admin";
import { time12 } from "@/lib/hours";
import { addClosure, closeDay, removeClosure, saveDay, saveDetails } from "../actions";
import { Submit } from "../submit";
import { Banner, btn, btnDanger, btnPrimary, Card, Field, input, PageHead } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hours" };

type Shift = { day: number; open_at: string; close_at: string };
type Closure = { date: string; label: string };
type Settings = { tagline: string; blurb: string; phone: string; email: string; street: string; city: string; state: string; zip: string; max_party: number; last_seating_mins: number; lead_hours: number; days_ahead: number };

const DAYS = [
  { n: 1, name: "Monday" }, { n: 2, name: "Tuesday" }, { n: 3, name: "Wednesday" }, { n: 4, name: "Thursday" },
  { n: 5, name: "Friday" }, { n: 6, name: "Saturday" }, { n: 0, name: "Sunday" },
];
const hhmm = (t: string) => t.slice(0, 5);
const SHIFTS = 3; // rows shown per day: existing shifts, then a blank one to add another (max 3 here, 4 stored)

export default async function HoursAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { error } = await searchParams;
  const [hs, cs, st] = await Promise.all([
    supabase.from("hours_weekly").select("*").order("day").order("sort"),
    supabase.from("closures").select("*").order("date"),
    supabase.from("settings").select("*").eq("id", 1).single(),
  ]);
  const shifts = (hs.data ?? []) as Shift[];
  const closures = (cs.data ?? []) as Closure[];
  const s = st.data as Settings | null;

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6 md:pt-8">
      <PageHead title="Hours & details" sub="Opening hours drive the “open now” sign and the times guests can pick when they ask for a table." />
      <Banner error={error} />

      <h2 className="mt-8 font-heading text-2xl font-semibold">Weekly hours</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {DAYS.map((d) => {
          const mine = shifts.filter((x) => x.day === d.n);
          const rows = Array.from({ length: Math.min(SHIFTS, Math.max(2, mine.length + 1)) }, (_, i) => mine[i] ?? null);
          return (
            <Card key={d.n}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-heading text-xl font-semibold">{d.name}</h3>
                <p className="text-sm text-espresso/70">{mine.length === 0 ? "Closed" : mine.map((m) => `${time12(hhmm(m.open_at))} – ${time12(hhmm(m.close_at))}`).join(", ")}</p>
              </div>
              <form action={saveDay.bind(null, d.n)} className="mt-3 space-y-2">
                {rows.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                    <Field label={i === 0 ? "Opens" : `Opens (shift ${i + 1})`}><input type="time" name={`open_${i}`} defaultValue={r ? hhmm(r.open_at) : ""} step={300} className={input} /></Field>
                    <span aria-hidden className="pb-3 text-espresso/75">to</span>
                    <Field label={i === 0 ? "Closes" : "Closes"}><input type="time" name={`close_${i}`} defaultValue={r ? hhmm(r.close_at) : ""} step={300} className={input} /></Field>
                  </div>
                ))}
                <p className="text-xs text-espresso/75">Leave a row empty to skip it. Use a second shift for a lunch and dinner split.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Submit className={btnPrimary}>Save {d.name}</Submit>
                </div>
              </form>
              {mine.length > 0 && (
                <form action={closeDay.bind(null, d.n)} className="mt-2">
                  <Submit busy="…" className={`${btn} !min-h-9`}>Closed all day</Submit>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      <h2 className="mt-10 font-heading text-2xl font-semibold">Closures</h2>
      <Card className="mt-3">
        <p className="text-sm text-espresso/75">Holidays and private days when the doors stay shut. They show on the site and block table requests for that date.</p>
        <ul className="mt-3 divide-y divide-dashed divide-espresso/20">
          {closures.map((c) => (
            <li key={c.date} className="flex items-center justify-between gap-3 py-3">
              <span><span className="font-medium">{c.label}</span> <span className="text-espresso/65">· {new Date(`${c.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span></span>
              <form action={removeClosure.bind(null, c.date)}><Submit busy="…" className={`${btnDanger} !min-h-9`}>Remove<span className="sr-only"> {c.label}</span></Submit></form>
            </li>
          ))}
          {closures.length === 0 && <li className="py-4 text-center font-hand text-2xl text-espresso/75">No closures set.</li>}
        </ul>
        <form action={addClosure} className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          <Field label="Date"><input required type="date" name="date" className={input} /></Field>
          <Field label="Name"><input required name="label" placeholder="Christmas Day" className={input} maxLength={60} /></Field>
          <Submit busy="Adding…" className={btnPrimary}>Add closure</Submit>
        </form>
      </Card>

      {s && (
        <>
          <h2 className="mt-10 font-heading text-2xl font-semibold">Restaurant details</h2>
          <Card className="mt-3">
            <form action={saveDetails} className="grid gap-3 sm:grid-cols-2">
              <Field label="Tagline" className="sm:col-span-2"><input required name="tagline" defaultValue={s.tagline} className={input} maxLength={120} /></Field>
              <Field label="Short description" className="sm:col-span-2"><textarea required name="blurb" defaultValue={s.blurb} rows={3} className={input} maxLength={400} /></Field>
              <Field label="Phone"><input required type="tel" name="phone" defaultValue={s.phone} className={input} maxLength={30} /></Field>
              <Field label="Email"><input required type="email" name="email" defaultValue={s.email} className={input} maxLength={120} /></Field>
              <Field label="Street" className="sm:col-span-2"><input required name="street" defaultValue={s.street} className={input} maxLength={120} /></Field>
              <Field label="City"><input required name="city" defaultValue={s.city} className={input} maxLength={60} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="State"><input required name="state" defaultValue={s.state} className={input} maxLength={2} /></Field>
                <Field label="ZIP"><input required name="zip" inputMode="numeric" defaultValue={s.zip} className={input} maxLength={10} /></Field>
              </div>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-medium text-espresso">Table requests</legend>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Largest party"><input required name="max_party" inputMode="numeric" defaultValue={s.max_party} className={input} /></Field>
                  <Field label="Last seating (min before close)"><input required name="last_seating_mins" inputMode="numeric" defaultValue={s.last_seating_mins} className={input} /></Field>
                  <Field label="Notice needed (hours)"><input required name="lead_hours" inputMode="numeric" defaultValue={s.lead_hours} className={input} /></Field>
                  <Field label="Book ahead (days)"><input required name="days_ahead" inputMode="numeric" defaultValue={s.days_ahead} className={input} /></Field>
                </div>
              </fieldset>
              <div className="sm:col-span-2"><Submit className={btnPrimary}>Save details</Submit></div>
            </form>
          </Card>
        </>
      )}
    </main>
  );
}
