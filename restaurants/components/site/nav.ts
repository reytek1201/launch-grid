import type { SiteData } from "@/lib/types";

export type NavItem = { href: string; label: string; short: string; note: string };

/** Pages behind the "More" tab on phones, and the right-hand end of the desktop bar. Present only when the client has the content. */
export function moreNav(site: SiteData): NavItem[] {
  return [
    ...(site.story ? [{ href: "/story", label: "Our story", short: "Story", note: "Five generations, one sauce" }] : []),
    ...(site.events ? [{ href: "/events", label: "Private events", short: "Events", note: "Birthdays, dinners, the whole room" }] : []),
    { href: "/gallery", label: "Gallery", short: "Gallery", note: "A walk along the clothesline" },
    { href: "/visit", label: "Hours & location", short: "Visit", note: "Find the olive-green door" },
    { href: "/contact", label: "Contact", short: "Contact", note: "Send us a postcard" },
  ];
}

export const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
