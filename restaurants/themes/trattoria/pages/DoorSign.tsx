"use client";

import { useEffect, useState } from "react";
import { openStatus } from "@/lib/hours";
import type { SiteData } from "@/lib/types";

// The wooden sign that hangs on the door: Aperto or Chiuso, from the real hours.
export function DoorSign({ site }: { site: SiteData }) {
  const [status, setStatus] = useState<{ open: boolean; note: string } | null>(null);
  useEffect(() => {
    const tick = () => setStatus(openStatus(site));
    const first = requestAnimationFrame(tick);
    const id = setInterval(tick, 60_000);
    return () => { cancelAnimationFrame(first); clearInterval(id); };
  }, [site]);

  return (
    <div className="sign-swing mx-auto w-64 select-none" aria-live="polite">
      <div aria-hidden className="mx-auto flex w-40 justify-between">
        <span className="h-10 w-px rotate-[18deg] bg-[#b88a3e]" />
        <span className="h-10 w-px -rotate-[18deg] bg-[#b88a3e]" />
      </div>
      <div
        className="rounded-xl border-4 border-[#3a2416] px-6 py-5 text-center text-cream shadow-[0_18px_30px_rgb(20_12_8/0.45)]"
        style={{ background: "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.04) 0 2px, transparent 2px 22px), linear-gradient(180deg, #6b4428, #4a2e1b)" }}
      >
        <p className="font-hand text-6xl leading-none text-[#f2b27a]">{status ? (status.open ? "Aperto" : "Chiuso") : "Orari"}</p>
        <p className="mt-2 text-sm text-cream/85">{status ? status.note : "Checking the hours…"}</p>
      </div>
    </div>
  );
}
