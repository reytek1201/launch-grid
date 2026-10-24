import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { Flourish } from "@/components/motion/Flourish";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { GlowStrip } from "@/components/site/GlowStrip";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import { OpenSign } from "@/components/site/OpenSign";
import { getPhoto, getSiteData } from "@/lib/config";
import { address, price } from "@/lib/format";

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;
const featured = ["burrata", "tagliatelle", "ossobuco", "tiramisu"];

export default function Home() {
  const site = getSiteData();
  const items = site.menu.flatMap((s) => s.items.map((i) => ({ ...i, course: s.title })));
  const picks = featured.map((id) => items.find((i) => i.id === id)!).filter(Boolean);

  return (
    <main id="main">
      {/* La Porta */}
      <section className="relative">
        <PhotoSlot photo="sp-01" ratio="aspect-[4/5] sm:aspect-[16/9] min-h-[75svh]" sizes="100vw" hero className="w-full" focal="60% 50%" />
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 bg-gradient-to-t from-espresso/85 via-espresso/10 to-transparent px-6 pb-12 text-center text-cream">
          <OpenSign site={site} />
          <h1 className="text-4xl md:text-6xl">{site.name}</h1>
          <p className="font-hand text-3xl">{site.tagline}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Magnetic><a href={tel(site.phone)} className="btn btn-solid">Reserve a table</a></Magnetic>
            <Magnetic><Link href="/menu" className="btn btn-line-light">See the menu</Link></Magnetic>
          </div>
        </div>
      </section>

      {/* The room */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-20 md:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl md:text-4xl">Come hungry. Stay a while.</h2>
          <Flourish className="mt-2" />
          <p className="mt-5 text-lg leading-relaxed">{site.blurb}</p>
          <p className="mt-4 text-lg leading-relaxed">Fifty-five seats, one long table, and a wood-fired oven that never really cools down.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <PhotoSlot photo="sp-03" ratio="aspect-[4/3]" sizes="(min-width: 768px) 50vw, 100vw" className="rounded-lg" />
        </Reveal>
      </section>

      <GlowStrip><PhotoSlot photo="sp-11" ratio="aspect-[21/9]" sizes="100vw" className="w-full" focal="50% 40%" /></GlowStrip>

      {/* From the kitchen */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-20">
        <Reveal>
          <p className="font-hand text-3xl text-terracotta-deep">From the kitchen</p>
          <h2 className="text-3xl md:text-4xl">A few things to start with</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {picks.map((d, n) => (
            <Reveal key={d.id} delay={n * 0.08}>
              <Link href={`/menu#${d.id}`} className="group block">
                <TiltCard><PhotoSlot photo={d.photo} ratio="aspect-[4/5]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="rounded-lg" /></TiltCard>
                <p className="mt-3 font-hand text-xl text-terracotta-deep">{d.course}</p>
                <h3 className="text-base leading-snug sm:text-lg"><span className="ink">{d.name}</span></h3>
                <p className="text-sm text-espresso/75">{price(d.price)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center"><Link href="/menu" className="ink font-semibold text-terracotta-deep">The whole menu</Link></p>
      </section>

      {/* Hand-made */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-20 md:grid-cols-2">
          <Reveal>
            <PhotoSlot photo="sp-06" ratio="aspect-[4/5]" focal="50% 55%" sizes="(min-width: 768px) 45vw, 100vw" className="rounded-lg" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-hand text-3xl text-terracotta-deep">Every morning</p>
            <h2 className="text-3xl md:text-4xl">Rolled by hand, before we open</h2>
            <p className="mt-5 text-lg leading-relaxed">Flour, eggs, a wooden pin and patience. The tagliatelle for the Sunday sauce is cut a few hours before it reaches your table, and not a minute earlier.</p>
          </Reveal>
        </div>
      </section>

      {/* Il Conto */}
      <section className="relative isolate overflow-hidden bg-espresso text-cream">
        {getPhoto("sp-10") && (
          <div className="absolute inset-0 -z-10 opacity-25">
            <PhotoSlot photo="sp-10" ratio="h-full" sizes="100vw" className="h-full" />
          </div>
        )}
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-24 md:grid-cols-2">
          <Reveal>
            <p className="font-hand text-3xl">Il conto</p>
            <h2 className="text-3xl md:text-5xl">Find a seat with us</h2>
            <address className="mt-6 text-lg not-italic leading-relaxed">
              {site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}<br />
              <a href={tel(site.phone)} className="underline">{site.phone}</a>
            </address>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic><a href={tel(site.phone)} className="btn btn-terra">Reserve a table</a></Magnetic>
              <Magnetic><Link href="/visit" className="btn btn-line-light">Hours &amp; directions</Link></Magnetic>
            </div>
            <p className="sr-only">{address(site.address)}</p>
          </Reveal>
          <Reveal delay={0.1}><HoursReceipt site={site} className="mx-auto w-full max-w-sm" /></Reveal>
        </div>
      </section>
    </main>
  );
}
