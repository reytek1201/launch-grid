"use client";

import { motion, useDragControls, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { scrollToTop } from "@/components/motion/scrollToTop";
import { address } from "@/lib/format";
import { openStatus } from "@/lib/hours";
import type { SiteData } from "@/lib/types";
import { isActive, moreNav } from "./nav";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const tel = (p: string) => `tel:+1${p.replace(/\D/g, "")}`;

/* Small ink icons, drawn with the same round line as the rest of the site. */
const Icon = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const HomeIcon = () => <Icon><path d="M6 21V11a6 6 0 0 1 12 0v10M3.5 21h17M14.5 15.5h.01" /></Icon>;
const MenuIcon = () => <Icon><path d="M6 3v6a2 2 0 0 0 4 0V3M8 11v10M17 21V3c-2.4 1.6-3.4 4-3.4 7.5H17" /></Icon>;
const CellarIcon = () => <Icon><path d="M7.5 3h9c0 5.5-1.2 8.5-4.5 8.5S7.5 8.5 7.5 3zM12 11.5V19M8 21h8" /></Icon>;
const MoonIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor"><path d="M20.4 14.6A8.6 8.6 0 1 1 9.4 3.6a7 7 0 0 0 11 11z" /></svg>
);
const MoreIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="2.3" /><circle cx="19" cy="12" r="1.7" />
  </svg>
);

/** The bar hides while a text field has focus, so the on-screen keyboard never stacks on top of it. */
function useTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const field = "input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,select";
    const on = (e: FocusEvent) => { if ((e.target as HTMLElement | null)?.matches?.(field)) setTyping(true); };
    const off = () => setTyping(false);
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", off);
    return () => { document.removeEventListener("focusin", on); document.removeEventListener("focusout", off); };
  }, []);
  return typing;
}

const tabBase = "relative flex h-16 flex-col items-center justify-end gap-0.5 pb-2 [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] transition-colors duration-[250ms]";
const label = "font-hand text-[1.1rem] leading-none";

/*
 * Phone navigation, like a native app: five tabs at the thumb, Reserve raised in the middle.
 * "More" opens a bottom sheet with the rest of the pages. Desktop keeps the top bar.
 */
export function TabBar({ site }: { site: SiteData }) {
  const path = usePathname();
  const typing = useTyping();
  const [more, setMore] = useState(false);
  const more_ = moreNav(site);
  const moreActive = more_.some((i) => isActive(path, i.href));

  const tab = (href: string, text: string, icon: ReactNode) => {
    const on = isActive(path, href);
    return (
      <li>
        <Link
          href={href}
          aria-current={on ? "page" : undefined}
          onClick={(e) => { if (on) { e.preventDefault(); scrollToTop(); } }}
          className={`${tabBase} active:scale-95 ${on ? "text-[#f2b27a]" : "text-cream/75 hover:text-cream"}`}
        >
          {on && <span aria-hidden className="absolute left-1/2 top-1.5 h-1 w-1 -translate-x-1/2 rounded-full bg-[#f2b27a] shadow-[0_0_8px_2px_rgb(242_178_122/0.6)]" />}
          {icon}
          <span className={label}>{text}</span>
        </Link>
      </li>
    );
  };

  const reserveOn = isActive(path, "/reserve");

  return (
    <>
      <nav
        aria-label="Main"
        className={`fixed inset-x-0 bottom-0 z-40 md:hidden transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${typing ? "translate-y-full" : "translate-y-0"}`}
      >
        <div className="relative bg-[#1a100b]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b88a3e]/80 to-transparent" />
          <ul className="mx-auto grid max-w-md grid-cols-5 px-1">
            {tab("/", "Home", <HomeIcon />)}
            {tab("/menu", "Menu", <MenuIcon />)}
            <li>
              <Link
                href="/reserve"
                aria-current={reserveOn ? "page" : undefined}
                onClick={(e) => { if (reserveOn) { e.preventDefault(); scrollToTop(); } }}
                className={`${tabBase} active:scale-95 ${reserveOn ? "text-[#f2b27a]" : "text-cream"}`}
              >
                <span
                  aria-hidden
                  className={`absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-5 place-items-center rounded-full bg-[#d9693f] text-espresso ring-4 ring-[#1a100b] shadow-[0_0_22px_rgb(217_105_63/0.5)] transition-transform duration-[250ms] ${reserveOn ? "scale-105 bg-[#f2b27a]" : ""}`}
                >
                  <MoonIcon />
                </span>
                <span className="h-6" aria-hidden />
                <span className={label}>Reserve</span>
              </Link>
            </li>
            {tab("/cellar", "Cellar", <CellarIcon />)}
            <li>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={more}
                onClick={() => setMore(true)}
                className={`${tabBase} w-full active:scale-95 ${moreActive ? "text-[#f2b27a]" : "text-cream/75 hover:text-cream"}`}
              >
                {moreActive && <span aria-hidden className="absolute left-1/2 top-1.5 h-1 w-1 -translate-x-1/2 rounded-full bg-[#f2b27a] shadow-[0_0_8px_2px_rgb(242_178_122/0.6)]" />}
                <MoreIcon />
                <span className={label}>More</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <MoreSheet site={site} open={more} onClose={() => setMore(false)} />
    </>
  );
}

/* The rest of the pages, as a bottom sheet: swipe it down, tap outside, press Esc or pick a page. */
function MoreSheet({ site, open, onClose }: { site: SiteData; open: boolean; onClose: () => void }) {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();
  const drag = useDragControls();
  const items = moreNav(site);
  // Only while open (so it is never built into the page ahead of time): is the kitchen open right now?
  const status = open ? openStatus(site) : null;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address(site.address))}`;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label="More pages"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === dialog.current) onClose(); }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-cream backdrop:bg-[#0c0705]/70 backdrop:backdrop-blur-sm md:hidden"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: open ? 0 : "100%" }}
        transition={{ duration: reduce ? 0 : 0.38, ease: EASE }}
        onAnimationComplete={() => { if (!open && dialog.current?.open) dialog.current.close(); }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, i) => { if (i.offset.y > 90 || i.velocity.y > 500) onClose(); }}
        className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] border-t border-[#b88a3e]/60 bg-[#1f140d] pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgb(0_0_0/0.55)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-t-[1.75rem] bg-[radial-gradient(ellipse_at_15%_0%,rgb(255_190_110/0.14),transparent_60%)]" />
        {/* Grab handle: drag from here */}
        <div onPointerDown={(e) => drag.start(e)} className="relative touch-none px-5 pb-1 pt-3">
          <span aria-hidden className="mx-auto block h-1 w-10 rounded-full bg-cream/30" />
          <div className="mt-3 flex items-center justify-between">
            <h2 className="font-hand text-3xl text-[#f2b27a]">Esplora</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 text-cream/90 transition-colors duration-[250ms] hover:border-cream active:scale-95">
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>

        <ul className="relative px-5">
          {items.map((it) => {
            const on = isActive(path, it.href);
            return (
              <li key={it.href} className="border-b border-dashed border-cream/15 last:border-b-0">
                <Link href={it.href} onClick={onClose} aria-current={on ? "page" : undefined} className="group flex min-h-16 items-center justify-between gap-4 py-3">
                  <span>
                    <span className={`block font-heading text-xl leading-tight ${on ? "text-[#f2b27a]" : ""}`}>{it.label}</span>
                    <span className="block text-sm text-cream/75">{it.note}</span>
                  </span>
                  <span aria-hidden className="font-hand text-3xl text-[#f2b27a] transition-transform duration-[250ms] group-active:translate-x-1">→</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="relative mt-3 px-5">
          <p className="text-sm text-cream/80" aria-live="polite">
            <span className="font-hand text-xl text-[#f2b27a]">{status ? (status.open ? "Aperto" : "Chiuso") : " "}</span>
            {status && <> · {status.note}</>}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a href={tel(site.phone)} className="btn btn-terra text-center">Call us</a>
            <a href={maps} target="_blank" rel="noreferrer" className="btn btn-line-light text-center">Directions</a>
          </div>
        </div>
      </motion.div>
    </dialog>
  );
}
