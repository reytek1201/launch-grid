import Link from "next/link";
import type { SiteData } from "@/lib/types";
import { photos } from "@/lib/config";
import { CellarScene } from "./CellarScene";
import { CheckScene } from "./CheckScene";
import { type Course, CourseScene } from "./CourseScene";
import { CourseTracker } from "./CourseTracker";
import { DoorScene } from "./DoorScene";
import type { InkName } from "./Ink";
import { LanternStrip } from "./LanternStrip";
import { TableScene } from "./TableScene";

// Theme copy and art per course id. Courses not listed still get a scene with defaults.
const STYLE: Record<string, { line: string; backdrop?: string; ink: InkName[]; sideways?: boolean }> = {
  antipasti: { line: "Bread, good oil, something to share.", backdrop: "sp-05", ink: ["bread", "fork", "glass"] },
  primi: { line: "Rolled this morning. Sauced since dawn.", backdrop: "sp-06", ink: ["fork", "knife"], sideways: true },
  secondi: { line: "From the wood fire, in no hurry.", backdrop: "sp-04", ink: ["plate", "knife", "glass"] },
  dolci: { line: "Coffee, something sweet, stay a little longer.", backdrop: "sp-12", ink: ["cup", "fork"] },
};
const NUMERALS = ["I", "II", "III", "IV", "V", "VI"];

export function MealInScroll({ site }: { site: SiteData }) {
  // The meal is the menu: every course with dishes becomes a scene, drinks excluded.
  const courses: Course[] = site.menu
    .filter((s) => s.items.length > 0 && s.id !== "bevande")
    .map((s, i) => {
      const style = STYLE[s.id] ?? { line: s.note ?? "", ink: ["plate"] as InkName[] };
      const photoDishes = s.items.filter((i) => i.photo);
      const withPhotos = photoDishes.length ? photoDishes : s.items.slice(0, 2);
      return { id: s.id, title: s.title, numeral: NUMERALS[i] ?? String(i + 1), line: style.line, backdrop: style.backdrop, ink: style.ink, dishes: withPhotos };
    });

  // Three wines the house wants to talk about; the real cellar photo (sp-13) replaces the candle once it exists.
  const picks = site.cellar
    .flatMap((s) => s.wines)
    .filter((w) => w.pick && !w.soldOut)
    .slice(0, 3)
    .map((w) => ({ id: w.id, name: w.name, where: `${w.region}${w.vintage ? ` · ${w.vintage}` : ""}`, glass: w.glass, bottle: w.bottle }));
  const cellarPhoto = photos["sp-13"] ? "sp-13" : "sp-10";

  return (
    <>
      <DoorScene site={site} />
      <LanternStrip />
      {courses.length === 0 ? (
        <section className="px-6 py-20 text-center"><Link href="/menu" className="ink text-xl font-semibold text-terracotta-deep">See the menu</Link></section>
      ) : (
        courses.map((c) => (STYLE[c.id]?.sideways ? <TableScene key={c.id} course={c} /> : <CourseScene key={c.id} course={c} />))
      )}
      {picks.length > 0 && <CellarScene photo={cellarPhoto} picks={picks} />}
      <CheckScene site={site} />
      <CourseTracker stops={[...courses.map((c) => ({ id: c.id, label: c.title })), { id: "conto", label: "Il conto" }]} />
    </>
  );
}
