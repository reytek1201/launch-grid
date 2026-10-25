"use client";

import { motion, useTransform } from "framer-motion";
import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { price } from "@/lib/format";
import { Ink } from "./Ink";
import { usePassing } from "./useScene";

export type CellarPick = { id: string; name: string; where: string; glass?: number; bottle?: number };

// A short stop between dessert and the check: the cellar door, three bottles worth asking about.
export function CellarScene({ photo, picks }: { photo: string; picks: CellarPick[] }) {
  const { ref, progress } = usePassing();
  const y = useTransform(progress, [0, 1], ["-8%", "10%"]);
  const scale = useTransform(progress, [0, 0.5, 1], [1.02, 1.12, 1.2]);
  const draw = useTransform(progress, [0.2, 0.5], [0, 1]);
  const bottleY = useTransform(progress, [0, 1], [40, -40]);

  return (
    <section ref={ref} id="cantina" aria-labelledby="cantina-title" className="relative isolate overflow-hidden bg-[#170d0a] py-24 text-cream md:py-32">
      <motion.div aria-hidden className="absolute inset-[-10%_0] -z-10 opacity-55" style={{ y, scale }}>
        <PhotoSlot photo={photo} ratio="h-full w-full" sizes="100vw" className="h-full" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#170d0a] via-[#170d0a]/70 to-[#170d0a]/30" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[#170d0a] to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#170d0a] to-transparent" />

      <motion.div aria-hidden className="absolute right-[8%] top-24 hidden w-16 text-cream/70 md:block" style={{ y: bottleY }}>
        <Ink name="bottle" draw={draw} strokeWidth={1.2} />
      </motion.div>

      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="font-hand text-3xl text-[#f2b27a] md:text-4xl">Dalla cantina</p>
          <h2 id="cantina-title" className="mt-1 max-w-xl text-4xl leading-[1] md:text-6xl">Something in the glass</h2>
          <p className="mt-4 max-w-md text-lg text-cream/85">A short list, all Italian, kept down the stairs. Ask what is open tonight.</p>
        </Reveal>

        <ul className="mt-10 max-w-xl divide-y divide-dashed divide-cream/25">
          {picks.map((w, n) => (
            <li key={w.id}>
              <Reveal delay={0.08 * n}>
                <Link href={`/cellar#${w.id}`} className="group flex items-baseline justify-between gap-4 py-4">
                  <span className="min-w-0">
                    <span className="ink block font-hand text-3xl leading-tight">{w.name}</span>
                    <span className="block text-sm uppercase tracking-[0.12em] text-cream/80">{w.where}</span>
                  </span>
                  <span className="shrink-0 text-right font-semibold">
                    {typeof w.glass === "number" ? <>{price(w.glass)}<span className="ml-1 text-xs font-normal uppercase tracking-[0.15em] text-cream/80">glass</span></> : <>{price(w.bottle ?? null)}<span className="ml-1 text-xs font-normal uppercase tracking-[0.15em] text-cream/80">bottle</span></>}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <Magnetic><Link href="/cellar" className="btn btn-line-light">Open the cellar</Link></Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
