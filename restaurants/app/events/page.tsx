import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { EventForm } from "@/components/site/EventForm";
import { RusticCard } from "@/components/site/RusticCard";
import { getSiteData } from "@/lib/config";
import { price } from "@/lib/format";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";

export const metadata: Metadata = {
  title: "Private events",
  description: "Birthdays, rehearsal dinners and team dinners at Trattoria Cinque Lune: a long table, a wood-fired oven and a menu built around your night.",
};

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

export default function Events() {
  const site = getSiteData();
  const events = site.events;
  if (!events) notFound();

  return (
    <main id="main">
      <PageHero kicker="Feste e riunioni" title="Private events" line="A long table, a hot oven and a menu built around your night." photo="sp-03" focal="50% 55%" ink="plate" />

      {/* Intro */}
      <section className="mx-auto max-w-3xl px-5 pb-6 pt-14 text-center md:px-8 md:pt-20">
        <Reveal>
          <p className="text-xl leading-relaxed text-espresso/90 md:text-2xl">{events.intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic><a href="#inquiry" className="btn btn-solid">Start an inquiry</a></Magnetic>
            <Magnetic><a href={tel(site.phone)} className="btn btn-line-dark">Call {site.phone}</a></Magnetic>
          </div>
        </Reveal>
      </section>

      {/* Rooms */}
      <section aria-labelledby="rooms" className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <h2 id="rooms" className="font-hand text-5xl text-terracotta-deep md:text-6xl">Tre sale · Three ways to gather</h2>
        <ul className="mt-10 grid gap-10 md:grid-cols-3">
          {events.spaces.map((s, i) => (
            <li key={s.id}>
              <Reveal delay={i * 0.1}>
                <RusticCard className={i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"} pad="p-3 pb-5">
                  <PhotoSlot photo={s.photo} ratio="aspect-[4/3]" focal={s.focal} sizes="(min-width: 768px) 30vw, 100vw" className="paper-photo" />
                  <h3 className="mt-4 px-1 font-heading text-2xl leading-tight">{s.name}</h3>
                  <p className="mt-1 px-1 font-hand text-2xl text-terracotta-deep">{s.capacity}</p>
                  <p className="mt-2 px-1 text-espresso/85">{s.blurb}</p>
                </RusticCard>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Menus, on the dark chalkboard */}
      <section aria-labelledby="menus" className="bg-[#170d0a] text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="font-hand text-3xl text-[#f2b27a]">I menu</p>
          <h2 id="menus" className="mt-1 max-w-xl text-4xl leading-tight md:text-5xl">Pick a table, then a menu</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {events.packages.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 0.1} className="h-full">
                  <article className="flex h-full flex-col rounded-sm border border-cream/25 bg-[#1f2b26]/70 p-6 shadow-[0_18px_40px_rgb(0_0_0/0.4)]">
                    <h3 className="font-heading text-2xl">{p.name}</h3>
                    <p className="mt-1 font-hand text-2xl text-[#f2b27a]">from {price(p.from)} per guest</p>
                    <p className="mt-3 text-cream/90">{p.blurb}</p>
                    <ul className="mt-4 space-y-2 border-t border-dashed border-cream/25 pt-4 text-sm text-cream/90">
                      {p.includes.map((line) => (
                        <li key={line} className="flex gap-2"><span aria-hidden className="text-[#f2b27a]">·</span>{line}</li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-cream/80">Prices are for food, before drinks, tax and gratuity. Demo prices, not a real menu.</p>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <h2 id="how" className="font-hand text-5xl text-terracotta-deep md:text-6xl">Come funziona</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          {events.steps.map((s, i) => (
            <li key={s.title} className="relative">
              <Reveal delay={i * 0.08}>
                <span aria-hidden className="grid h-14 w-14 place-items-center rounded-full border-2 border-terracotta-deep font-heading text-2xl text-terracotta-deep">{i + 1}</span>
                <h3 className="mt-4 font-heading text-xl">{s.title}</h3>
                <p className="mt-1 text-espresso/85">{s.text}</p>
              </Reveal>
              {i < events.steps.length - 1 && <span aria-hidden className="absolute left-16 top-7 hidden w-[calc(100%-2.5rem)] border-t-2 border-dashed border-terracotta/40 md:block" />}
            </li>
          ))}
        </ol>
      </section>

      {/* Questions */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-5 pb-16 md:px-8 md:pb-24">
        <h2 id="faq" className="font-hand text-5xl text-terracotta-deep md:text-6xl">Domande</h2>
        <Reveal>
          <RusticCard className="mt-8 rotate-[0.3deg]" pad="px-5 py-3 sm:px-8">
            <div className="divide-y divide-dashed divide-espresso/30">
              {events.faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg marker:hidden [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="shrink-0 text-2xl leading-none text-terracotta-deep transition-transform duration-[250ms] group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-espresso/90">{f.a}</p>
                </details>
              ))}
            </div>
          </RusticCard>
        </Reveal>
      </section>

      {/* Inquiry */}
      <section id="inquiry" aria-labelledby="inquiry-title" className="scroll-mt-24 bg-espresso/[0.04] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <RusticCard className="-rotate-[0.4deg]" pad="p-0">
              <EventForm site={site} />
            </RusticCard>
          </Reveal>
          <InkOnView name="olive" className="mx-auto mt-10 w-36 text-olive/70" />
        </div>
      </section>
    </main>
  );
}
