import type { Metadata } from "next";
import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Flourish } from "@/components/motion/Flourish";
import { Reveal } from "@/components/motion/Reveal";
import { getSiteData } from "@/lib/config";
import { price } from "@/lib/format";
import type { Wine } from "@/lib/types";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";

export const metadata: Metadata = { title: "Wine cellar", description: "Italian wines by the glass and by the bottle at Trattoria Cinque Lune." };

const STONE = "radial-gradient(120% 60% at 50% 0%, #3a2218 0%, transparent 70%), linear-gradient(180deg, #24150f 0%, #170d0a 100%)";
const SLATE = "radial-gradient(90% 70% at 30% 20%, rgb(255 255 255 / 0.07), transparent 70%), #1f2b26";

export default function Cellar() {
  const site = getSiteData();
  const sections = site.cellar.filter((s) => s.wines.length > 0);
  const dish = new Map(site.menu.flatMap((s) => s.items).map((i) => [i.id, i.name]));
  const picks = sections.flatMap((s) => s.wines).filter((w) => w.pick && !w.soldOut);

  const pairing = (w: Wine, light = false) => {
    const found = (w.pairs ?? []).filter((id) => dish.has(id));
    if (found.length === 0) return null;
    return (
      <p className={`mt-1.5 text-sm ${light ? "text-cream/85" : "text-espresso/80"}`}>
        <span className={light ? "font-hand text-xl text-[#f2b27a]" : "font-hand text-xl text-wine"}>with </span>
        {found.map((id, n) => (
          <span key={id}>
            {n > 0 && ", "}
            <Link href={`/menu#${id}`} className={`ink ${light ? "text-cream" : "text-terracotta-deep"}`}>{dish.get(id)}</Link>
          </span>
        ))}
      </p>
    );
  };

  const prices = (w: Wine, light = false) => (
    <dl className={`flex shrink-0 gap-4 text-right ${w.soldOut ? "line-through" : ""} ${light ? "text-cream" : "text-espresso"}`}>
      {[["Glass", w.glass], ["Bottle", w.bottle]].map(
        ([label, cents]) =>
          typeof cents === "number" && (
            <div key={label as string}>
              <dt className={`text-[0.65rem] font-normal uppercase tracking-[0.18em] ${light ? "text-cream/80" : w.soldOut ? "text-espresso/70" : "text-espresso/70"}`}>{label}</dt>
              <dd className="font-semibold">{price(cents)}</dd>
            </div>
          ),
      )}
    </dl>
  );

  return (
    <main id="main" style={{ backgroundImage: STONE }}>
      <PageHero kicker="La Cantina" title="The wine cellar" line="A short list, chosen by hand, all of it Italian. Ask us what is open tonight." photo="sp-13" focal="50% 55%" />

      <nav aria-label="Wine list" className="sticky top-[var(--header-offset,0px)] z-20 border-y border-cream/10 bg-espresso/90 backdrop-blur transition-[top] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]">
        <ul className="mx-auto flex max-w-3xl justify-start gap-5 overflow-x-auto px-4 py-2 font-hand text-xl sm:justify-center sm:px-6 sm:py-3 sm:text-2xl">
          {picks.length > 0 && <li><a href="#consiglio" className="ink whitespace-nowrap text-[#f2b27a]">Il Consiglio</a></li>}
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="ink whitespace-nowrap text-[#f2b27a]">{s.title}</a></li>
          ))}
        </ul>
      </nav>

      {/* Il Consiglio: the chalkboard behind the bar */}
      {picks.length > 0 && (
        <section id="consiglio" aria-labelledby="consiglio-title" className="scroll-mt-28 px-3 pt-10 sm:px-6 md:scroll-mt-36 md:pt-16">
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-sm border-[10px] border-[#4a2e1b] shadow-[0_30px_50px_rgb(0_0_0/0.55),inset_0_0_30px_rgb(0_0_0/0.5)]" style={{ background: SLATE }}>
              <div className="px-5 py-8 sm:px-10">
                <div className="text-center">
                  <h2 id="consiglio-title" className="font-hand text-5xl text-cream">Il Consiglio</h2>
                  <p className="mt-1 font-hand text-2xl text-[#f2b27a]">what we are pouring for friends this week</p>
                </div>
                <ul className="mt-6 divide-y divide-dashed divide-cream/25">
                  {picks.map((w) => (
                    <li key={w.id} className="flex items-start justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <h3 className="font-hand text-3xl leading-tight text-cream">{w.name}</h3>
                        <p className="text-sm uppercase tracking-[0.12em] text-cream/80">{w.producer} · {w.region}{w.vintage ? ` · ${w.vintage}` : ""}</p>
                        {w.notes && <p className="mt-1 text-cream/90">{w.notes}</p>}
                        {pairing(w, true)}
                      </div>
                      {prices(w, true)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* The pour: a quiet band between the board and the book */}
      <section aria-label="Pairing help" className="relative mt-10 overflow-hidden md:mt-16">
        <PhotoSlot photo="sp-14" ratio="aspect-[4/3] md:aspect-[21/9]" sizes="100vw" focal="55% 50%" className="w-full" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#170d0a]/90 via-[#170d0a]/35 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <Reveal>
            <div className="mx-auto max-w-6xl px-5 md:px-8">
              <p className="font-hand text-3xl text-[#f2b27a] md:text-4xl">Not sure?</p>
              <p className="mt-1 max-w-[11.5rem] font-heading text-2xl leading-tight text-cream md:max-w-md md:text-4xl">Tell us what you are eating and we will pour you a taste.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The list, in the cellar book */}
      <div className="px-3 py-10 sm:px-6 md:py-16">
        <article className="relative mx-auto max-w-3xl drop-shadow-[0_30px_50px_rgb(0_0_0/0.55)]">
          <div aria-hidden className="paper absolute inset-0" />
          <div className="relative px-5 pb-12 pt-10 sm:px-12 md:px-16">
            <header className="text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.4em] text-espresso/70">Libro dei vini</p>
              <p className="font-heading text-4xl text-espresso md:text-5xl">Cinque Lune</p>
              <p className="mt-3 text-sm text-espresso/75">Glass 5 oz · Bottle 750 ml · All wines Italian</p>
            </header>

            {sections.map((s, n) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 pt-10 md:scroll-mt-36">
                <InkOnView name={n % 2 === 0 ? "grapes" : "bottle"} className={`mx-auto mb-6 text-espresso/55 ${n % 2 === 0 ? "w-14" : "w-6"}`} />
                <Reveal>
                  <div className="text-center">
                    <h2 className="font-hand text-5xl text-terracotta-deep">{s.title}</h2>
                    <Flourish width={140} className="mx-auto -mt-1" />
                    {s.note && <p className="mt-1 text-espresso/75">{s.note}</p>}
                  </div>
                </Reveal>
                <ul className="mt-6 divide-y divide-dashed divide-espresso/20">
                  {s.wines.map((w) => (
                    <li key={w.id} id={w.id} className="scroll-mt-28 py-4 md:scroll-mt-36">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className={`font-heading text-lg leading-snug ${w.soldOut ? "text-espresso/70 line-through" : "text-espresso"}`}>
                            {w.name}
                            {w.organic && <span className="ml-2 align-middle text-[0.65rem] font-normal uppercase tracking-[0.18em] text-olive">organic</span>}
                          </h3>
                          <p className="mt-0.5 text-sm uppercase tracking-[0.1em] text-espresso/70">
                            {w.producer} · {w.region}{w.vintage ? ` · ${w.vintage}` : ""}
                          </p>
                          {w.grape && <p className="text-sm italic text-espresso/75">{w.grape}</p>}
                          {w.notes && <p className={`mt-1 text-[0.95rem] ${w.soldOut ? "text-espresso/70" : "text-espresso/80"}`}>{w.notes}</p>}
                          {!w.soldOut && pairing(w)}
                          {w.soldOut && <p className="mt-1 font-hand text-2xl text-wine">finito</p>}
                        </div>
                        {prices(w)}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <footer className="mt-12 text-center">
              <p className="font-hand text-3xl text-terracotta-deep">Salute!</p>
              <p className="mt-2 text-sm text-espresso/75">Not sure what to choose? Tell us what you are eating and we will pour you a taste. Please enjoy responsibly. Must be 21 to order wine.</p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
