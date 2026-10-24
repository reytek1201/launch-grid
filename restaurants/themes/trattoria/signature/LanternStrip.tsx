"use client";

import { motion, useTransform } from "framer-motion";
import { PhotoSlot } from "@/components/PhotoSlot";
import { GlowStrip } from "@/components/site/GlowStrip";
import { usePassing } from "./useScene";

// A breath between the door and the first course: the five moons, drifting.
export function LanternStrip() {
  const { ref, progress } = usePassing();
  const y = useTransform(progress, [0, 1], ["-14%", "14%"]);
  const textX = useTransform(progress, [0, 1], ["12%", "-12%"]);
  return (
    <section ref={ref} aria-label="Five moons" className="relative overflow-hidden bg-espresso">
      <GlowStrip>
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-[21/9]">
          <motion.div className="absolute inset-[-16%_0]" style={{ y }}>
            <PhotoSlot photo="sp-11" ratio="h-full w-full" sizes="100vw" focal="50% 40%" className="h-full" />
          </motion.div>
          <motion.p
            className="absolute inset-x-0 bottom-[10%] px-4 text-center font-hand text-3xl text-cream drop-shadow md:whitespace-nowrap md:text-6xl"
            style={{ x: textX }}
          >
            Cinque lune, una tavola lunga.
          </motion.p>
        </div>
      </GlowStrip>
    </section>
  );
}
