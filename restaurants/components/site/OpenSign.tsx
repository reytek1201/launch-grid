"use client";

import { useEffect, useState } from "react";
import type { SiteData } from "@/lib/types";
import { openStatus } from "@/lib/hours";

// Computed after mount so a cached page never shows a stale Aperto/Chiuso.
export function OpenSign({ site, className = "" }: { site: SiteData; className?: string }) {
  const [status, setStatus] = useState<{ open: boolean; note: string } | null>(null);

  useEffect(() => {
    const update = () => setStatus(openStatus(site));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [site]);

  return (
    <p className={`sign-swing inline-flex items-center gap-3 rounded-full border border-current px-4 py-1.5 text-sm ${className}`} aria-live="polite">
      <span className="font-hand text-2xl leading-none">{status ? (status.open ? "Aperto" : "Chiuso") : "Orari"}</span>
      <span>{status ? status.note : "Hours below"}</span>
    </p>
  );
}
