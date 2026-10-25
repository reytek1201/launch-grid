import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { Moons } from "@/components/site/Moons";
import { RusticCard } from "@/components/site/RusticCard";
import { getSiteData } from "@/lib/config";
import type { InkName } from "@/themes/trattoria/signature/Ink";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";
import { StoryTimeline } from "@/themes/trattoria/pages/StoryTimeline";

export const metadata: Metadata = {
  title: "Our story",
  description: "Five generations, one Sunday sauce: how a pantry in the hills became Trattoria Cinque Lune.",
};

const VALUE_INK: InkName[] = ["bread", "lantern", "glass"];

export default async function Story() {
  const site = await getSiteData();
  const story = site.story;
  if (!story) notFound();

  return (
    <main id="main">
      <PageHero kicker="La nostra storia" title={story.headline} photo="sp-06" focal="50% 42%" ink="bread" />

      <section className="mx-auto max-w-3xl px-5 py-14 text-center md:px-8 md:py-20">
        <Reveal>
          <p className="text-xl leading-relaxed text-espresso/90 md:text-2xl">{story.intro}</p>
          <p className="mt-4 text-sm text-espresso/75">A fictional family, written for this demo.</p>
        </Reveal>
      </section>

      <section aria-labelledby="timeline" className="mx-auto max-w-5xl px-5 pb-16 md:px-8 md:pb-24">
        <h2 id="timeline" className="sr-only">Our story through the years</h2>
        <StoryTimeline chapters={story.chapters} />
      </section>

      {/* What we still do */}
      <section aria-labelledby="values" className="bg-[#170d0a] text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="font-hand text-3xl text-[#f2b27a]">Come facciamo</p>
          <h2 id="values" className="mt-1 text-4xl leading-tight md:text-5xl">What has not changed</h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3">
            {story.values.map((v, i) => (
              <li key={v.title}>
                <Reveal delay={i * 0.1}>
                  <InkOnView name={VALUE_INK[i % VALUE_INK.length]} className="h-20 w-16 text-[#f2b27a]/85" />
                  <h3 className="mt-4 font-heading text-2xl leading-snug">{v.title}</h3>
                  <p className="mt-2 text-cream/90">{v.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The recipe card */}
      <section aria-labelledby="recipe" className="mx-auto grid max-w-5xl items-center gap-12 px-5 py-16 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-24">
        <Reveal>
          <p className="font-hand text-4xl text-terracotta-deep">Nobody leaves hungry</p>
          <p className="mt-3 text-lg leading-relaxed text-espresso/90">
            The Sunday ragù is on the menu every night of the week. The recipe card is older than the restaurant, and so is the rule that goes with it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Magnetic><Link href="/menu" className="btn btn-solid">See the menu</Link></Magnetic>
            <Magnetic><Link href="/reserve" className="btn btn-line-dark">Reserve a table</Link></Magnetic>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <RusticCard className="-rotate-2" pad="p-7 sm:p-9">
            <h2 id="recipe" className="font-hand text-4xl text-terracotta-deep sm:text-5xl">{story.recipe.title}</h2>
            <ul className="mt-4" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 2.2rem, rgb(43 29 20 / 0.2) 2.2rem 2.25rem)" }}>
              {story.recipe.lines.map((l) => (
                <li key={l} className="font-hand text-2xl leading-[2.25rem] text-espresso">{l}</li>
              ))}
            </ul>
            <p className="mt-4 font-hand text-2xl text-terracotta-deep">{story.recipe.note}</p>
            <Moons id="moon-story" className="mt-4 h-2.5 w-auto text-terracotta/80" />
          </RusticCard>
        </Reveal>
      </section>
    </main>
  );
}
