import { pageMeta } from "@/lib/meta";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import { RusticCard } from "@/components/site/RusticCard";
import { getSiteData } from "@/lib/config";
import { address } from "@/lib/format";
import { DoorSign } from "@/themes/trattoria/pages/DoorSign";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { PageHero } from "@/themes/trattoria/pages/PageHero";

export const generateMetadata = pageMeta("Hours & location", "visit", (n) => `Opening hours, address and directions for ${n}.`);

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

export default async function Visit() {
  const site = await getSiteData();
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address(site.address))}`;

  return (
    <main id="main">
      <PageHero kicker="Vieni a trovarci" title="Hours & location" line="Look for the olive-green door and the lemon trees." photo="sp-01" focal="60% 50%" ink="lantern" />

      <div className="mx-auto grid max-w-6xl items-start gap-14 px-5 py-14 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-20">
        <div className="space-y-12">
          <Reveal><DoorSign site={site} /></Reveal>
          <Reveal delay={0.1}><HoursReceipt as="h2" site={site} className="mx-auto w-full max-w-md -rotate-1" /></Reveal>
        </div>

        <Reveal delay={0.1}>
          <div>
            <h2 className="font-hand text-5xl text-terracotta-deep">Find us</h2>
            <address className="mt-3 text-xl not-italic leading-relaxed">
              {site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}
            </address>
            <p className="mt-3"><a href={tel(site.phone)} className="ink text-lg font-semibold text-terracotta-deep">{site.phone}</a></p>
            <p className="mt-1"><a href={`mailto:${site.email}`} className="ink text-terracotta-deep">{site.email}</a></p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Magnetic><a href={maps} target="_blank" rel="noreferrer" className="btn btn-solid">Open in Maps</a></Magnetic>
              <Magnetic><a href={tel(site.phone)} className="btn btn-line-dark">Call us</a></Magnetic>
            </div>
            <p className="mt-6 text-espresso/80">Parking: street parking on Fig Alley, and a free lot one block east after 5 pm. (Demo details, not a real address.)</p>
            <RusticCard className="mt-10 rotate-1" pad="p-3 pb-4">
              <PhotoSlot photo="sp-08" ratio="aspect-[4/3]" focal="50% 55%" sizes="(min-width: 768px) 45vw, 100vw" className="paper-photo" />
              <p className="mt-2 px-1 font-hand text-2xl text-espresso/80">Ask for the window booth.</p>
            </RusticCard>
            <InkOnView name="olive" className="ml-auto mt-6 w-40 text-olive/70" />
          </div>
        </Reveal>
      </div>
    </main>
  );
}
