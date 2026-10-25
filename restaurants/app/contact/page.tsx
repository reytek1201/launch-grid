import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { RusticCard } from "@/components/site/RusticCard";
import { getSiteData } from "@/lib/config";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";

export const metadata: Metadata = { title: "Contact", description: "Send Trattoria Cinque Lune a postcard: questions, parties, hellos. Or call the kitchen." };

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

export default function Contact() {
  const site = getSiteData();
  return (
    <main id="main">
      <PageHero kicker="Scrivici" title="Send us a postcard" line="Reservations, parties, questions, hellos." photo="sp-08" focal="50% 55%" ink="cup" />
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <RusticCard flat className="-rotate-[0.6deg]" pad="p-0">
            <ContactForm name={site.name.replace("Trattoria ", "")} />
          </RusticCard>
        </Reveal>
        <Reveal delay={0.1}>
          <div>
            <h2 className="font-hand text-5xl text-terracotta-deep">Or just call</h2>
            <p className="mt-3"><a href={tel(site.phone)} className="ink text-2xl font-semibold text-terracotta-deep">{site.phone}</a></p>
            <address className="mt-5 text-lg not-italic leading-relaxed">{site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}</address>
            <p className="mt-4"><a href={`mailto:${site.email}`} className="ink text-terracotta-deep">{site.email}</a></p>
            <InkOnView name="glass" className="mt-10 w-16 text-espresso/50" />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
