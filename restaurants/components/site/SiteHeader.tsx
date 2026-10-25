"use client";

import Link from "next/link";
import { scrollToTop } from "@/components/motion/scrollToTop";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useHideOnScroll } from "@/components/motion/useHideOnScroll";
import type { SiteData } from "@/lib/types";
import { Moons } from "./Moons";

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

export function SiteHeader({ site }: { site: SiteData }) {
  const path = usePathname();
  const links = navFor(site);
  const home = path === "/";
  const hidden = useHideOnScroll(path, true);
  const bar = useRef<HTMLElement>(null);
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
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-offset", hidden || home ? "0px" : `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden, home]);

  // On Home the header floats over the dark scenes; elsewhere it is a solid cream bar.
  const skin = dark
    ? "fixed inset-x-0 text-cream bg-gradient-to-b from-espresso/75 via-espresso/35 to-transparent"
    : "fixed inset-x-0 text-espresso bg-paper/95 backdrop-blur border-b border-espresso/10";

  return (
    <header ref={bar} className={`top-0 z-40 transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${hidden ? "-translate-y-full" : "translate-y-0"} ${skin}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pt-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 md:py-4">
        <Link href="/" onClick={(e) => { if (path === "/") { e.preventDefault(); scrollToTop(); } }} className="group flex items-center gap-3 whitespace-nowrap">
          <span className="flex flex-col leading-none">
            <span className="text-[0.65rem] uppercase tracking-[0.35em] opacity-80">Trattoria</span>
            <span className="font-heading text-2xl font-semibold tracking-tight md:text-[1.7rem]">Cinque Lune</span>
          </span>
          <Moons className={`h-3 w-auto transition-transform md:max-lg:hidden duration-[250ms] group-hover:scale-110 ${dark ? "text-[#f2b27a]" : "text-terracotta"}`} />
        </Link>
        <div className="flex items-center gap-6">
          <nav aria-label="Main" className="-mx-4 flex gap-x-5 overflow-x-auto whitespace-nowrap px-4 text-sm sm:mx-0 sm:px-0 md:gap-x-4 md:text-[0.9rem] lg:gap-x-7 lg:text-[0.95rem]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined} className={`ink py-2.5 ${path === l.href ? "bg-[length:100%_2px]" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/reserve" className={`btn hidden !px-5 !py-2 text-sm md:inline-block ${dark ? "btn-terra" : "btn-solid"}`}>
            Reserve
          </Link>
        </div>
      </div>
    </header>
  );
}
