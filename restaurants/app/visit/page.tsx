import type { Metadata } from "next";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { PhotoSlot } from "@/components/PhotoSlot";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import { OpenSign } from "@/components/site/OpenSign";
import { getSiteData } from "@/lib/config";
import { address } from "@/lib/format";

export const metadata: Metadata = { title: "Hours & location" };

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

export default function Visit() {
  const site = getSiteData();
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address(site.address))}`;

  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-14">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl">Hours &amp; location</h1>
        <div className="mt-5"><OpenSign site={site} className="text-terracotta-deep" /></div>
      </div>

      <div className="mt-12 grid items-start gap-12 md:grid-cols-2">
        <Reveal><HoursReceipt as="h2" site={site} className="mx-auto w-full max-w-md" /></Reveal>
        <Reveal delay={0.1}><div>
          <h2 className="text-2xl">Find us</h2>
          <address className="mt-3 text-lg not-italic leading-relaxed">
            {site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}
          </address>
          <p className="mt-3"><a href={tel(site.phone)} className="ink text-lg font-semibold text-terracotta-deep">{site.phone}</a></p>
          <p className="mt-1"><a href={`mailto:${site.email}`} className="text-terracotta-deep underline">{site.email}</a></p>
          <p className="mt-6">
            <Magnetic><a href={maps} target="_blank" rel="noreferrer" className="btn btn-solid">Open in Maps</a></Magnetic>
          </p>
          <p className="mt-6 text-espresso/80">Parking: street parking on Fig Alley, and a free lot one block east after 5 pm. (Demo details, not a real address.)</p>
          <PhotoSlot photo="sp-08" ratio="aspect-[4/3]" focal="50% 55%" sizes="(min-width: 768px) 45vw, 100vw" className="mt-8 rounded-lg" />
        </div></Reveal>
      </div>
    </main>
  );
}
