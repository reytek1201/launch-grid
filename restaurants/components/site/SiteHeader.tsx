"use client";

import Link from "next/link";
import { scrollToTop } from "@/components/motion/scrollToTop";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHideOnScroll } from "@/components/motion/useHideOnScroll";
import type { SiteData } from "@/lib/types";
import { Moons } from "./Moons";
import { isActive } from "./nav";
import { brandOf } from "@/lib/brand";

// Pages that exist only when the client has the content for them.
const navFor = (site: SiteData) => [
  { href: "/menu", label: "Menu" },
  { href: "/cellar", label: "Cellar" },
  ...(site.story ? [{ href: "/story", label: "Story" }] : []),
  ...(site.events ? [{ href: "/events", label: "Events" }] : []),
  { href: "/gallery", label: "Gallery" },
  { href: "/visit", label: "Visit" },
  { href: "/contact", label: "Contact" },
];

// The specials banner: one solid line at the top of the header, so it moves and hides with it.
// Visitors can close it; it stays closed for the visit, and comes back when the message changes.
export function Strip({ text, onClose }: { text?: string; onClose: () => void }) {
  if (!text) return null;
  return (
    <div role="status" className="relative bg-terracotta-deep py-1.5 pl-4 pr-12 text-center text-[0.8rem] font-medium leading-snug text-cream sm:text-sm">
      {text}
      <button type="button" onClick={onClose} aria-label="Close this notice" className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-cream/90 hover:bg-cream/15 hover:text-cream">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
    </div>
  );
}

const CLOSED_KEY = "banner-closed";

export function SiteHeader({ site }: { site: SiteData }) {
  const path = usePathname();
  const links = navFor(site);
  const brand = brandOf(site.name);
  const home = path === "/";
  const hidden = useHideOnScroll(path, true);
  const bar = useRef<HTMLElement>(null);
  const [closedText, setClosedText] = useState<string | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try { setClosedText(sessionStorage.getItem(CLOSED_KEY)); } catch { /* private mode: it just shows */ }
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const banner = site.banner && site.banner !== closedText ? site.banner : undefined;
  const closeBanner = () => {
    setClosedText(site.banner ?? null);
    try { sessionStorage.setItem(CLOSED_KEY, site.banner ?? ""); } catch { /* ignore */ }
  };
  const phoneBar = useRef<HTMLElement>(null);
  // Inner pages open on a dark hero (data-hero): float over it, turn solid once past it.
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const check = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      setOverHero(!!hero && window.scrollY < hero.offsetHeight - 72);
    };
    const first = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [path]);
  const dark = home || overHero;

  // Publish how much of the screen the header covers, so sticky bars (the menu's course nav) sit below it.
  // Phones: the slim bar never hides. Desktop: the full header slides away on scroll down.
  useEffect(() => {
    const desk = bar.current;
    const phone = phoneBar.current;
    if (!desk || !phone) return;
    const set = () => {
      const px = desk.offsetHeight > 0 ? (hidden ? 0 : desk.offsetHeight) : phone.offsetHeight;
      document.documentElement.style.setProperty("--header-offset", home ? "0px" : `${px}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(desk);
    ro.observe(phone);
    return () => ro.disconnect();
  }, [hidden, home]);

  // On Home the header floats over the dark scenes; elsewhere it is a solid cream bar.
  const skin = dark
    ? "fixed inset-x-0 text-cream bg-gradient-to-b from-espresso/75 via-espresso/35 to-transparent"
    : "fixed inset-x-0 text-espresso bg-paper/95 backdrop-blur border-b border-espresso/10";

  const phone = (
    <header ref={phoneBar} className="fixed inset-x-0 top-0 z-40 border-b border-[#b88a3e]/40 bg-[#1a100b]/95 pt-[env(safe-area-inset-top)] text-cream backdrop-blur-md md:hidden">
      <Strip text={banner} onClose={closeBanner} />
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/" onClick={(e) => { if (path === "/") { e.preventDefault(); scrollToTop(); } }} className="flex items-center gap-2.5 whitespace-nowrap [-webkit-tap-highlight-color:transparent]">
          <span className="flex flex-col leading-none">
            {brand.kicker && <span className="text-[0.6rem] uppercase tracking-[0.35em] text-cream/80">{brand.kicker}</span>}
            <span className="font-heading text-[1.35rem] font-semibold tracking-tight">{brand.main}</span>
          </span>
          <Moons className="h-2.5 w-auto text-[#f2b27a]" />
        </Link>
        <a href={`tel:+1${site.phone.replace(/\D/g, "")}`} aria-label={`Call ${site.phone}`} className="grid h-11 w-11 place-items-center rounded-full border border-[#f2b27a]/60 text-[#f2b27a] transition-[transform,background-color] duration-[250ms] active:scale-95 active:bg-[#f2b27a]/15 [-webkit-tap-highlight-color:transparent]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
        </a>
      </div>
    </header>
  );

  return (
    <>
    {phone}
    <header ref={bar} className={`top-0 z-40 hidden md:block transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${hidden ? "-translate-y-full" : "translate-y-0"} ${skin}`}>
      <Strip text={banner} onClose={closeBanner} />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" onClick={(e) => { if (path === "/") { e.preventDefault(); scrollToTop(); } }} className="group flex items-center gap-3 whitespace-nowrap">
          <span className="flex flex-col leading-none">
            {brand.kicker && <span className="text-[0.65rem] uppercase tracking-[0.35em] opacity-80">{brand.kicker}</span>}
            <span className="font-heading text-[1.7rem] font-semibold tracking-tight">{brand.main}</span>
          </span>
          <Moons className={`h-3 w-auto transition-transform max-lg:hidden duration-[250ms] group-hover:scale-110 ${dark ? "text-[#f2b27a]" : "text-terracotta"}`} />
        </Link>
        <div className="flex items-center gap-6">
          <nav aria-label="Pages" className="flex gap-x-4 whitespace-nowrap text-[0.9rem] lg:gap-x-7 lg:text-[0.95rem]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isActive(path, l.href) ? "page" : undefined} className={`ink py-2.5 ${isActive(path, l.href) ? "bg-[length:100%_2px]" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/reserve" className={`btn !px-5 !py-2 text-sm ${dark ? "btn-terra" : "btn-solid"}`}>
            Reserve
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
