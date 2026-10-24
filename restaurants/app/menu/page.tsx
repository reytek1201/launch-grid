import type { Metadata } from "next";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Flourish } from "@/components/motion/Flourish";
import { Reveal } from "@/components/motion/Reveal";
import { DietTags } from "@/components/site/DietTags";
import { getSiteData } from "@/lib/config";
import { price } from "@/lib/format";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";
import type { InkName } from "@/themes/trattoria/signature/Ink";

export const metadata: Metadata = { title: "Menu", description: "Antipasti, primi, secondi and dolci at Trattoria Cinque Lune." };

const DIVIDER: Record<string, InkName> = { antipasti: "bread", primi: "fork", secondi: "plate", dolci: "cup", bevande: "glass" };
const WOOD =
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.025) 0 2px, transparent 2px 160px), linear-gradient(180deg, #3a2416 0%, #2b1d14 100%)";

export default function Menu() {
  const site = getSiteData();
  const sections = site.menu.filter((s) => s.items.length > 0);

  return (
    <main id="main" style={{ backgroundImage: WOOD }}>
      <PageHero kicker="Il menù" title="What's cooking" line="Pasta is rolled by hand each morning. The sauce has been going since dawn." photo="sp-09" focal="50% 50%" ink="olive" />

      <nav aria-label="Courses" className="sticky top-[var(--header-offset,0px)] z-20 border-y border-cream/10 bg-espresso/90 backdrop-blur transition-[top] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]">
        <ul className="mx-auto flex max-w-3xl justify-start gap-5 overflow-x-auto px-4 py-2 font-hand text-xl sm:justify-center sm:px-6 sm:py-3 sm:text-2xl">
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="ink whitespace-nowrap text-[#f2b27a]">{s.title}</a></li>
          ))}
        </ul>
      </nav>

      {/* The printed menu, on aged paper, lying on the table */}
      <div className="px-3 py-10 sm:px-6 md:py-16">
        <article className="relative mx-auto max-w-3xl drop-shadow-[0_30px_50px_rgb(0_0_0/0.55)]">
          <div aria-hidden className="paper absolute inset-0" />
          <div className="relative px-5 pb-12 pt-10 sm:px-12 md:px-16">
            <header className="text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.4em] text-espresso/70">Trattoria</p>
              <p className="font-heading text-4xl text-espresso md:text-5xl">Cinque Lune</p>
              <p className="mt-3 text-sm text-espresso/75">
                <abbr title="vegetarian">V</abbr> vegetarian · <abbr title="vegan">VG</abbr> vegan · <abbr title="gluten-free">GF</abbr> gluten-free · MP market price
              </p>
            </header>

            {sections.map((s, n) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 pt-10 md:scroll-mt-36">
                {n > 0 && DIVIDER[s.id] && <InkOnView name={DIVIDER[s.id]} className={`mx-auto mb-6 text-espresso/55 ${["fork", "glass"].includes(DIVIDER[s.id]) ? "w-6" : "w-14"}`} />}
                <Reveal>
                  <div className="text-center">
                    <h2 className="font-hand text-5xl text-terracotta-deep">{s.title}</h2>
                    <Flourish width={140} className="mx-auto -mt-1" />
                    {s.note && <p className="mt-1 text-espresso/75">{s.note}</p>}
                  </div>
                </Reveal>
                <ul className="mt-6 divide-y divide-dashed divide-espresso/20">
                  {s.items.map((i) => (
                    <li key={i.id} id={i.id} className="group flex scroll-mt-28 gap-3 py-4 transition-transform duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5 md:scroll-mt-36 md:gap-4">
                      {i.photo && <PhotoSlot photo={i.photo} ratio="aspect-square" sizes="96px" className="paper-photo h-16 w-16 shrink-0 rounded-sm sm:h-20 sm:w-20" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className={`font-heading text-lg leading-snug ${i.soldOut ? "text-espresso/70 line-through" : "text-espresso"}`}>
                            {i.name}
                            <DietTags tags={i.tags} />
                          </h3>
                          <span aria-hidden className="leader hidden sm:block" />
                          <span className={`shrink-0 font-semibold ${i.soldOut ? "text-espresso/70 line-through" : "text-espresso"}`}>{price(i.price)}</span>
                        </div>
                        {i.description && <p className={`mt-1 text-[0.95rem] ${i.soldOut ? "text-espresso/70" : "text-espresso/80"}`}>{i.description}</p>}
                        {i.soldOut && <p className="mt-1 font-hand text-2xl text-wine">finito</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <footer className="mt-12 text-center">
              <p className="font-hand text-3xl text-terracotta-deep">Buon appetito</p>
              <p className="mt-2 text-sm text-espresso/75">Ask us about allergies. Prices before tax.</p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
