import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import { ReserveSlip } from "@/components/site/ReserveSlip";
import { RusticCard } from "@/components/site/RusticCard";
import { getSiteData } from "@/lib/config";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";

export const metadata: Metadata = {
  title: "Reserve a table",
  description: "Request a table at Trattoria Cinque Lune: pick a date, a time and how many of you are coming.",
};

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

export default async function Reserve() {
  const site = await getSiteData();
  return (
    <main id="main">
      <PageHero kicker="Prenota" title="Reserve a table" line="Pick a night. We will save you a seat by the oven." photo="sp-03b" focal="50% 55%" ink="glass" />
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.7fr_1fr]">
        <Reveal className="min-w-0">
          {site.links?.reserve && (
            <div className="mb-8 rounded-2xl border border-espresso/15 bg-paper/70 p-5">
              <h2 className="font-hand text-4xl text-terracotta-deep">Book online</h2>
              <p className="mt-1 text-espresso/85">See open tables and confirm instantly on our booking page.</p>
              <div className="mt-3"><a href={site.links.reserve} target="_blank" rel="noopener noreferrer" className="btn btn-solid">Book a table online<span className="sr-only"> (opens in a new tab)</span></a></div>
              <p className="mt-4 text-sm text-espresso/75">Or send us a request below and we will write back.</p>
            </div>
          )}
          <RusticCard flat className="-rotate-[0.4deg]" pad="p-0">
            <ReserveSlip site={site} />
          </RusticCard>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-10">
            <div>
              <h2 className="font-hand text-5xl text-terracotta-deep">Prefer to talk?</h2>
              <p className="mt-3"><a href={tel(site.phone)} className="ink text-2xl font-semibold text-terracotta-deep">{site.phone}</a></p>
              <p className="mt-3 text-espresso/85">Walk-ins are welcome at the bar and, when there is room, at the long table.</p>
              <div className="mt-4"><Magnetic><a href={tel(site.phone)} className="btn btn-line-dark">Call us</a></Magnetic></div>
            </div>
            <HoursReceipt as="h2" site={site} className="w-full max-w-sm -rotate-1" />
            <div>
              <h2 className="font-hand text-4xl text-terracotta-deep">Nine or more?</h2>
              <p className="mt-2 text-espresso/85">Birthdays, rehearsal dinners and team dinners have their own page.</p>
              <p className="mt-2"><Link href="/events" className="ink font-semibold text-terracotta-deep">See private events</Link></p>
            </div>
            <InkOnView name="lantern" className="ml-auto w-24 text-espresso/45" />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
