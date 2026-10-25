import { time12 } from "./hours";
import type { SiteData } from "./types";

const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Today's date (YYYY-MM-DD) and minutes since midnight, in the restaurant's time zone. */
export function todayIn(timeZone: string, now: Date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** Calendar maths on YYYY-MM-DD strings, free of time zones. */
const asUTC = (date: string) => new Date(`${date}T12:00:00Z`);
export const dayOfWeek = (date: string) => asUTC(date).getUTCDay();
export function addDays(date: string, n: number) {
  const d = asUTC(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const longDate = (date: string) => asUTC(date).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
export const shortDate = (date: string) => asUTC(date).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });

export type Slot = { value: string; label: string };

/** Why a date cannot be booked, or null when it is fine. */
export function dateIssue(site: SiteData, date: string, now: Date = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Choose a date.";
  const today = todayIn(site.timezone, now);
  if (date < today.date) return "That date has passed.";
  if (date > addDays(today.date, site.reservations.daysAhead)) return `We take requests up to ${site.reservations.daysAhead} days ahead.`;
  const closure = site.closures.find((c) => c.date === date);
  if (closure) return `We are closed for ${closure.label}.`;
  const day = site.hours.find((h) => h.day === dayOfWeek(date));
  if (!day || day.intervals.length === 0) return `We are closed on ${DAY_LONG[dayOfWeek(date)]}s.`;
  return null;
}

/** Half-hour seatings for a date, ending a little before closing. */
export function slotsFor(site: SiteData, date: string, now: Date = new Date()): Slot[] {
  if (dateIssue(site, date, now)) return [];
  const today = todayIn(site.timezone, now);
  const earliest = date === today.date ? today.minutes + site.reservations.leadHours * 60 : -1;
  const day = site.hours.find((h) => h.day === dayOfWeek(date));
  const out: Slot[] = [];
  for (const i of day?.intervals ?? []) {
    const last = toMin(i.close) - site.reservations.lastSeatingMins;
    for (let m = toMin(i.open); m <= last; m += 30) {
      if (m >= earliest) out.push({ value: hhmm(m), label: time12(hhmm(m)) });
    }
  }
  return out;
}

export const partyWord = (n: number) => (n === 1 ? "1 guest" : `${n} guests`);
