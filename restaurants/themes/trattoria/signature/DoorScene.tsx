"use client";

import Link from "next/link";
import { type MotionValue, motion, useMotionValue, useTransform } from "framer-motion";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { useRamp } from "@/components/motion/useRamp";
import { OpenSign } from "@/components/site/OpenSign";
import type { SiteData } from "@/lib/types";
import { Ink } from "./Ink";
import { useScene } from "./useScene";


/*
 * La Porta. One pinned frame, four beats:
 * 0.00-0.55 walk toward the door (zoom on the doorway, light floods in)
 * 0.45-0.68 dissolve into the dining room
 * 0.72-0.92 the room warms to evening
 * 0.70-1.00 "Come hungry" and the drifting name
 */
function Frame({ site, p, still, show = "both" }: { site: SiteData; p: MotionValue<number>; still: boolean; show?: "both" | "door" | "room" }) {
  const doorScale = useTransform(p, [0, 0.55], [1, 2.7]);
  const doorOpacity = useRamp(p, [0.5, 0.66], [1, 0]);
  const flood = useRamp(p, [0.32, 0.56], [0, 1]);
  const floodOut = useRamp(p, [0.56, 0.72], [1, 0]);
  const floodOpacity = useTransform([flood, floodOut], ([a, b]: number[]) => a * b);
  const roomOpacity = useRamp(p, [0.48, 0.66], [0, 1]);
  const roomScale = useTransform(p, [0.48, 1], [1.22, 1]);
  const eveningOpacity = useRamp(p, [0.72, 0.92], [0, 1]);
  const heroOpacity = useRamp(p, [0.04, 0.22], [1, 0]);
  const heroY = useTransform(p, [0, 0.25], ["0%", "-18%"]);
  const cueOpacity = useRamp(p, [0, 0.06], [1, 0]);
  const roomTextOpacity = useRamp(p, [0.76, 0.9], [0, 1]);
  const roomTextY = useTransform(p, [0.76, 1], [40, 0]);
  const ghostX = useTransform(p, [0.6, 1], ["18%", "-28%"]);
  const ghostOpacity = useRamp(p, [0.62, 0.8], [0, 0.22]);
  const inkDraw = useRamp(p, [0.74, 0.98], [0, 1]);
  const inkNearY = useTransform(p, [0.6, 1], [160, -40]);
  const inkFarY = useTransform(p, [0.6, 1], [80, 0]);

  return (
    <div className={`${still ? "relative" : "sticky top-0"} h-lvh overflow-hidden bg-espresso text-cream`}>
      {/* Outside */}
      <motion.div className="absolute inset-0 origin-[48%_62%] md:origin-[57%_60%]" style={{ scale: doorScale, opacity: doorOpacity }}>
        <PhotoSlot photo="sp-01" ratio="h-full w-full" sizes="100vw" hero focal="60% 50%" className="h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/15 to-espresso/10" />
      </motion.div>

      {/* Light through the door */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: floodOpacity, background: "radial-gradient(circle at 50% 55%, #ffd79a 0%, #f2a65a 35%, rgba(43,29,20,0.9) 85%)" }}
      />

      {/* Inside: afternoon, then evening */}
      <motion.div className="absolute inset-0" style={{ opacity: roomOpacity, scale: roomScale }}>
        <PhotoSlot photo="sp-03" ratio="h-full w-full" sizes="100vw" className="hidden h-full md:block" />
        <PhotoSlot photo="sp-03v" ratio="h-full w-full" sizes="100vw" className="h-full md:hidden" />
        <motion.div className="absolute inset-0 hidden md:block" style={{ opacity: eveningOpacity }}>
          <PhotoSlot photo="sp-03b" ratio="h-full w-full" sizes="100vw" className="h-full" />
        </motion.div>
        <motion.div className="absolute inset-0 bg-espresso/45 md:hidden" style={{ opacity: eveningOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/30 to-transparent" />
      </motion.div>

      {/* Giant outlined name drifting behind the words */}
      <motion.p
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] left-0 whitespace-nowrap font-heading text-[26vw] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-cream)] md:text-[18vw]"
        style={{ x: ghostX, opacity: ghostOpacity }}
      >
        Cinque Lune
      </motion.p>

      {/* Foreground ink, moving faster than the photo */}
      <motion.div aria-hidden className="pointer-events-none absolute -right-6 top-[14%] w-40 text-cream/80 md:right-[6%] md:w-64" style={{ y: inkNearY }}>
        <Ink name="olive" draw={inkDraw} strokeWidth={1.2} />
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none absolute right-[22%] top-0 hidden w-14 text-cream/70 md:block" style={{ y: inkFarY }}>
        <Ink name="lantern" draw={inkDraw} />
      </motion.div>

      {/* First frame: name, open sign, buttons */}
      {show !== "room" && <motion.div
        className="absolute inset-0 flex flex-col items-center justify-end gap-4 px-6 pb-32 text-center md:pb-20"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <OpenSign site={site} />
        <h1 className="text-5xl leading-none md:text-7xl">{site.name}</h1>
        <p className="font-hand text-3xl md:text-4xl">{site.tagline}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Magnetic><Link href="/reserve" className="btn btn-solid">Reserve a table</Link></Magnetic>
          <Magnetic><Link href="/menu" className="btn btn-line-light">See the menu</Link></Magnetic>
        </div>
      </motion.div>}
      {!still && (
        <motion.p aria-hidden className="absolute inset-x-0 bottom-5 hidden text-center font-hand text-xl text-cream/80 md:block" style={{ opacity: cueOpacity }}>
          Scroll to come in ↓
        </motion.p>
      )}

      {/* Inside words */}
      {show !== "door" && <motion.div
        className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-6"
        style={{ opacity: roomTextOpacity, y: roomTextY }}
      >
        <p className="font-hand text-3xl text-[#f2b27a]">Benvenuti</p>
        <h2 className="mt-1 max-w-xl text-4xl leading-tight md:text-6xl">Come hungry. Stay a while.</h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/90">{site.blurb}</p>
      </motion.div>}
    </div>
  );
}

export function DoorScene({ site }: { site: SiteData }) {
  const { ref, reduce, progress } = useScene(0);
  const end = useMotionValue(1);

  if (reduce) {
    // Reduced motion: the door, then the room, as two still frames.
    return (
      <>
        <section aria-label="Welcome"><Frame site={site} p={progress} still show="door" /></section>
        <section aria-label="The room"><Frame site={site} p={end} still show="room" /></section>
      </>
    );
  }
  return (
    <section ref={ref} aria-label="Welcome" className="relative h-[280vh] md:h-[340vh]">
      <Frame site={site} p={progress} still={false} />
    </section>
  );
}
