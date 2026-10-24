"use client";

import Link from "next/link";
import { type MotionValue, motion, useMotionValue, useTransform } from "framer-motion";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { useMedia } from "@/components/motion/useMedia";
import { useRamp } from "@/components/motion/useRamp";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import type { SiteData } from "@/lib/types";
import { Ink } from "./Ink";
import { useScene } from "./useScene";

const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

/*
 * Il Conto. Three columns on desktop so nothing covers the candle:
 * words and buttons | the check | the candle in its bottle.
 * Pinned: the candle pushes in toward the flame and glows, the check is presented
 * (it slides and settles but is always fully opaque and readable), the cup inks in,
 * and "Grazie" writes itself. Address, phone and buttons never move.
 */
function Frame({ site, p, pinned }: { site: SiteData; p: MotionValue<number>; pinned: boolean }) {
  const candleScale = useTransform(p, [0, 1], [1.04, 1.22]);
  const glow = useRamp(p, [0.1, 0.8], [0.15, 0.75]);
  const checkY = useTransform(p, [0, 0.45], ["38%", "0%"]);
  const checkRotate = useTransform(p, [0, 0.45], [-9, -2]);
  const cupDraw = useRamp(p, [0.15, 0.55], [0, 1]);
  const thanks = useTransform(useRamp(p, [0.55, 0.9], [0, 1]), (v) => `inset(-30% ${100 - v * 115}% -30% -10%)`);

  return (
    <div className={`${pinned ? "sticky top-0 h-svh" : "relative"} overflow-hidden bg-espresso text-cream`}>
      {/* Desktop: the candle photo fills the frame and melts into the dark on the left */}
      <motion.div
        aria-hidden
        className="absolute inset-0 hidden origin-[74%_22%] lg:block"
        style={{ scale: pinned ? candleScale : 1, maskImage: "linear-gradient(to right, transparent 18%, black 62%)", WebkitMaskImage: "linear-gradient(to right, transparent 18%, black 62%)" }}
      >
        <PhotoSlot photo="sp-10" ratio="h-full w-full" sizes="100vw" focal="70% 45%" className="h-full" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden mix-blend-screen lg:block"
        style={{ opacity: glow, background: "radial-gradient(circle at 74% 22%, rgba(255,190,100,0.5), rgba(255,150,60,0) 40%)" }}
      />
      <div className="mx-auto grid h-full max-w-6xl items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_1fr_0.85fr] lg:gap-8 lg:py-0">
        {/* Phones and tablets: the candle as a band on top */}
        <div className="relative h-64 overflow-hidden rounded-lg md:h-80 lg:hidden">
          <PhotoSlot photo="sp-10" ratio="h-full w-full" sizes="100vw" focal="72% 40%" className="h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 to-transparent" />
        </div>

        {/* Words and buttons: never animated */}
        <div>
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-[#f2b27a]">Il conto</p>
          <h2 id="conto-title" className="mt-1 text-4xl leading-tight md:text-5xl">Find a seat with us</h2>
          <address className="mt-6 text-lg not-italic leading-relaxed">
            {site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}<br />
            <a href={tel(site.phone)} className="ink">{site.phone}</a>
          </address>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic><a href={tel(site.phone)} className="btn btn-terra">Reserve a table</a></Magnetic>
            <Magnetic><Link href="/visit" className="btn btn-line-light">Hours &amp; directions</Link></Magnetic>
          </div>
          <div className="mt-10 flex items-end gap-5">
            <div className="relative w-24 text-cream/80 md:w-28">
              <Ink name="cup" draw={cupDraw} strokeWidth={1.6} />
            </div>
            <motion.p className="pr-3 font-hand text-6xl leading-none text-[#f2b27a] md:text-7xl" style={{ clipPath: thanks }}>
              Grazie!
            </motion.p>
          </div>
        </div>

        {/* The check: slides and settles, always fully readable */}
        <motion.div style={{ y: checkY, rotate: checkRotate }}>
          <HoursReceipt site={site} className="mx-auto w-full max-w-sm" />
        </motion.div>
      </div>
    </div>
  );
}

export function CheckScene({ site }: { site: SiteData }) {
  const { ref, reduce, progress } = useScene(1);
  // Pinned only where the three-column layout fits (1024px and up).
  const desktop = useMedia("(min-width: 1024px)");
  const done = useMotionValue(1);
  const pinned = desktop && !reduce;
  return (
    <section
      ref={ref}
      id="course-conto"
      data-course="conto"
      aria-labelledby="conto-title"
      className={pinned ? "relative h-[220vh]" : "relative"}
    >
      <Frame site={site} p={pinned ? progress : done} pinned={pinned} />
    </section>
  );
}
