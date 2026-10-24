import type { SiteData } from "@/lib/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function time12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

const intervalText = (i: { open: string; close: string }) => `${time12(i.open)} to ${time12(i.close)}`;

/** Rows for the hours receipt: Tue–Sat grouped when hours match, then Sunday, then Monday. */
export function hoursRows(site: SiteData) {
  const textFor = (d: number) => {
    const day = site.hours.find((h) => h.day === d)!;
    return day.intervals.length ? day.intervals.map(intervalText).join("\n") : "Closed";
  };
  const rows: { days: string; text: string }[] = [];
  let run: { from: number; to: number; text: string } | null = null;
  const flush = () => {
    if (!run) return;
    rows.push({ days: run.from === run.to ? DAY_NAMES[run.from] : `${DAY_NAMES[run.from]}–${DAY_NAMES[run.to]}`, text: run.text });
    run = null;
  };
  for (const d of [2, 3, 4, 5, 6]) {
    const text = textFor(d);
    if (run && run.text === text) run.to = d;
    else { flush(); run = { from: d, to: d, text }; }
  }
  flush();
  rows.push({ days: DAY_LONG[0], text: textFor(0) });
  rows.push({ days: DAY_LONG[1], text: textFor(1) });
  return rows;
}

function partsIn(timeZone: string, date: Date) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const p = Object.fromEntries(f.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    day: DAY_NAMES.indexOf(p.weekday),
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}

const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));

export function openStatus(site: SiteData, now: Date = new Date()) {
  const t = partsIn(site.timezone, now);
  const closure = site.closures.find((c) => c.date === t.date);
  if (closure) return { open: false, note: `Closed today for ${closure.label}` };
  const day = site.hours.find((h) => h.day === t.day);
  const live = day?.intervals.find((i) => t.minutes >= toMin(i.open) && t.minutes < toMin(i.close));
  if (live) return { open: true, note: `Open until ${time12(live.close)}` };
  const later = day?.intervals.find((i) => toMin(i.open) > t.minutes);
  return { open: false, note: later ? `Opens at ${time12(later.open)}` : "Closed right now" };
}
