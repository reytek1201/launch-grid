"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { HoursReceipt } from "@/components/site/HoursReceipt";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { Photo, SiteData } from "@/lib/types";
import { DoorSign } from "@/themes/trattoria/pages/DoorSign";
import { MenuBook } from "@/themes/trattoria/pages/MenuBook";
import { PageHero } from "@/themes/trattoria/pages/PageHero";
import type { InkName } from "@/themes/trattoria/signature/Ink";
import { applyState, initialState, type TryMessage, type TryState, cleanState } from "../state";

const DIVIDER: Record<string, InkName> = { antipasti: "bread", primi: "fork", secondi: "plate", dolci: "cup", bevande: "glass" };
const WOOD = "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.025) 0 2px, transparent 2px 160px), linear-gradient(180deg, #3a2416 0%, #2b1d14 100%)";

/**
 * Runs inside the sandbox's iframe. It waits for the admin page (its parent, same origin) to post the
 * visitor's changes, lays them over the demo data and re-renders the real site components. Links that would
 * leave this page are held, so the preview never wanders off into the unsandboxed site.
 */
export function SitePreview({ site, photos, wines }: { site: SiteData; photos: Record<string, Photo>; wines: Record<string, { id: string; name: string }[]> }) {
  const start = useMemo(() => initialState(site), [site]);
  const [state, setState] = useState<TryState>(start);
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onMessage = (e: MessageEvent<TryMessage>) => {
      if (e.origin !== window.location.origin || e.data?.type !== "lg-try:state") return;
      setState(cleanState(e.data.state, start));
      const focus = e.data.focus;
      if (focus) {
        requestAnimationFrame(() => {
          const el = focus === "top" ? document.body : document.getElementById(focus);
          if (!el) return;
          if (focus === "top") window.scrollTo({ top: 0, behavior: "smooth" });
          else el.scrollIntoView({ block: "center", behavior: "smooth" });
          if (focus !== "top") el.animate?.([{ backgroundColor: "rgb(185 83 47 / 0.22)" }, { backgroundColor: "rgb(185 83 47 / 0)" }], { duration: 1800, easing: "ease-out" });
        });
      }
    };
    window.addEventListener("message", onMessage);
    if (window.parent !== window) window.parent.postMessage({ type: "lg-try:ready" } satisfies TryMessage, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [start]);

  const live = useMemo(() => applyState(site, state), [site, state]);
  const sections = live.menu.filter((s) => s.items.length > 0);

  const hold = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href || href.startsWith("#")) return;
    e.preventDefault();
    setHeld(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHeld(false), 2600);
  };

  return (
    <div onClickCapture={hold}>
      <SiteHeader site={live} />
      <main id="main">
        <PageHero kicker="Stasera" title="Tonight at Cinque Lune" line="What the guests see, right now. Change something in the admin and watch it land here." photo="sp-09" focal="50% 50%" ink="olive" />
        <div id="hours" className="mx-auto grid max-w-3xl gap-10 px-5 py-12">
          <DoorSign site={live} />
          <HoursReceipt as="h2" site={live} className="mx-auto w-full max-w-md -rotate-1" />
        </div>
        <div style={{ backgroundImage: WOOD }} className="pb-6">
          <MenuBook name={live.name} sections={sections} photos={photos} wines={wines} dividers={DIVIDER} />
        </div>
      </main>
      <p role="status" aria-live="polite" className={`fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-2xl bg-espresso/95 px-4 py-3 text-center text-sm text-cream shadow-lg transition-[opacity,transform] duration-300 ${held ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {held ? "This preview stays on one page. The full demo site has the rest." : ""}
      </p>
    </div>
  );
}
