import Link from "next/link";
import type { SiteData } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/visit", label: "Hours & location" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ site }: { site: SiteData }) {
  return (
    <header className="md:sticky md:top-0 z-30 border-b border-espresso/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pt-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:py-3">
        <Link href="/" className="font-heading text-lg font-semibold leading-tight whitespace-nowrap">
          {site.name}
        </Link>
        <nav aria-label="Main" className="-mx-4 flex gap-x-5 overflow-x-auto whitespace-nowrap px-4 text-sm sm:mx-0 sm:gap-x-7 sm:px-0">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="ink py-2.5 hover:text-terracotta-deep">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
