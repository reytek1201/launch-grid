import type { Metadata } from "next";
import { Flourish } from "@/components/motion/Flourish";
import { Reveal } from "@/components/motion/Reveal";
import { PhotoSlot } from "@/components/PhotoSlot";
import { DietTags } from "@/components/site/DietTags";
import { getSiteData } from "@/lib/config";
import { price } from "@/lib/format";

export const metadata: Metadata = { title: "Menu", description: "Antipasti, primi, secondi and dolci at Trattoria Cinque Lune." };

export default function Menu() {
  const site = getSiteData();
  const sections = site.menu.filter((s) => s.items.length > 0);

  return (
    <main id="main">
      <div className="mx-auto max-w-3xl px-4 pt-10 text-center sm:px-6 md:pt-14">
        <h1 className="text-4xl md:text-5xl">The menu</h1>
        <p className="mt-3 font-hand text-2xl text-terracotta-deep">Pasta is made by hand each morning.</p>
        <p className="mt-3 text-sm text-espresso/75">
          <abbr title="vegetarian">V</abbr> vegetarian · <abbr title="vegan">VG</abbr> vegan · <abbr title="gluten-free">GF</abbr> gluten-free · MP market price
        </p>
      </div>

      <nav aria-label="Courses" className="sticky top-0 z-20 mt-8 border-y border-espresso/10 bg-cream/95 backdrop-blur">
        <ul className="mx-auto flex max-w-3xl justify-start gap-5 overflow-x-auto px-4 py-2 font-hand text-xl sm:justify-center sm:px-6 sm:py-3 sm:text-2xl">
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="ink whitespace-nowrap text-terracotta-deep">{s.title}</a></li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-20 pt-10 md:scroll-mt-32 md:pt-14">
            <Reveal>
              <h2 className="font-hand text-4xl text-terracotta-deep">{s.title}</h2>
              <Flourish width={140} className="-mt-1" />
              {s.note && <p className="mt-1 text-espresso/75">{s.note}</p>}
            </Reveal>
            <ul className="mt-6 divide-y divide-espresso/10">
              {s.items.map((i) => (
                <li key={i.id} id={i.id} className="group flex scroll-mt-20 gap-3 py-4 transition-transform duration-[250ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5 md:scroll-mt-32 md:gap-4 md:py-5">
                  {i.photo && <PhotoSlot photo={i.photo} ratio="aspect-square" sizes="96px" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 rounded-md" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className={`text-lg leading-snug ${i.soldOut ? "text-espresso/70 line-through" : ""}`}>
                        {i.name}
                        <DietTags tags={i.tags} />
                      </h3>
                      <span aria-hidden className="leader hidden sm:block" />
                      <span className={`shrink-0 font-semibold ${i.soldOut ? "text-espresso/70 line-through" : ""}`}>{price(i.price)}</span>
                    </div>
                    {i.description && <p className={`mt-1 text-[0.95rem] ${i.soldOut ? "text-espresso/70" : "text-espresso/80"}`}>{i.description}</p>}
                    {i.soldOut && <p className="mt-1 font-hand text-2xl text-wine">finito</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
