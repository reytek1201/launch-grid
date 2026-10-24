"use client";

import Link from "next/link";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import type { SiteData } from "@/lib/types";
import { Ink } from "./Ink";
import { usePassing } from "./useScene";

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

// Il Conto. Hours, address and buttons never move; only the candle and the ink do.
export function CheckScene({ site }: { site: SiteData }) {
  const { ref, progress } = usePassing();
  const reduce = useReducedMotion();
  const bgY = useTransform(progress, [0, 1], ["-10%", "10%"]);
  const cupY = useTransform(progress, [0, 1], [140, -140]);

  return (
    <section ref={ref} id="course-conto" data-course="conto" aria-labelledby="conto-title" className="relative isolate overflow-hidden bg-espresso text-cream">
      <motion.div className="absolute inset-[-12%_0] -z-10 opacity-35" style={{ y: bgY }}>
        <PhotoSlot photo="sp-10" ratio="h-full w-full" sizes="100vw" className="h-full" />
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none absolute right-[4%] top-[10%] hidden w-36 text-cream/60 md:block" style={{ y: cupY }}>
        <Ink name="cup" />
      </motion.div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-32">
        <div>
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-[#f2b27a]">Il conto</p>
          <h2 id="conto-title" className="mt-1 text-4xl md:text-6xl">Find a seat with us</h2>
          <address className="mt-6 text-lg not-italic leading-relaxed">
            {site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}<br />
            <a href={tel(site.phone)} className="ink">{site.phone}</a>
          </address>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href={tel(site.phone)} className="btn btn-terra">Reserve a table</a></Magnetic>
            <Magnetic><Link href="/visit" className="btn btn-line-light">Hours &amp; directions</Link></Magnetic>
          </div>
        </div>
        <HoursReceipt site={site} className="mx-auto w-full max-w-sm -rotate-1" />
      </div>
      <div className="pb-16 text-center">
        <motion.p
          className="inline-block font-hand text-6xl text-[#f2b27a] md:text-8xl"
          initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 0% 0 0)" }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
        >
          Grazie!
        </motion.p>
      </div>
    </section>
  );
}
