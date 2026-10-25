// Prints SQL that loads the demo fixtures into trattoria_demo. Usage: npx tsx scripts/seed-sql.ts > seed.sql
import { trattoria as s } from "../clients/demo/fixtures/trattoria";

const q = (v: string | number | boolean | null | undefined) =>
  v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : typeof v === "boolean" ? String(v) : `'${v.replace(/'/g, "''")}'`;
const arr = (a?: string[]) => `array[${(a ?? []).map(q).join(",")}]::text[]`;
const out: string[] = [];

out.push(`insert into trattoria_demo.settings values (1,${[s.name, s.tagline, s.blurb, s.address.street, s.address.city, s.address.state, s.address.zip, s.phone, s.email, s.timezone].map(q).join(",")},${s.reservations.maxParty},${s.reservations.lastSeatingMins},${s.reservations.leadHours},${s.reservations.daysAhead});`);
s.menu.forEach((sec, n) => {
  out.push(`insert into trattoria_demo.menu_sections values (${q(sec.id)},${q(sec.title)},${q(sec.note)},${n},false);`);
  sec.items.forEach((i, k) => out.push(`insert into trattoria_demo.menu_items values (${q(i.id)},${q(sec.id)},${q(i.name)},${q(i.description)},${q(i.price)},${arr(i.tags)},${!!i.soldOut},${q(i.photo)},${k},false);`));
});
s.cellar.forEach((sec, n) => {
  out.push(`insert into trattoria_demo.wine_sections values (${q(sec.id)},${q(sec.title)},${q(sec.note)},${n},false);`);
  sec.wines.forEach((w, k) => out.push(`insert into trattoria_demo.wines values (${q(w.id)},${q(sec.id)},${q(w.name)},${q(w.producer)},${q(w.region)},${q(w.grape)},${q(w.vintage)},${q(w.glass)},${q(w.bottle)},${q(w.notes)},${arr(w.pairs)},${!!w.organic},${!!w.soldOut},${!!w.pick},${k},false);`));
});
s.hours.forEach((d) => d.intervals.forEach((iv, k) => out.push(`insert into trattoria_demo.hours_weekly values (${d.day},'${iv.open}','${iv.close}',${k});`)));
s.closures.forEach((c) => out.push(`insert into trattoria_demo.closures values (${q(c.date)},${q(c.label)});`));
console.log(out.join("\n"));
