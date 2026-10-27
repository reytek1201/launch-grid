import type { Closure, SiteData } from "@/lib/types";

/**
 * Try the admin: everything a visitor changes lives here, in their own browser tab. Nothing is sent to the
 * database, nothing is emailed, and no other visitor ever sees it. The admin page holds the state and posts it
 * to the site preview (same origin, in an iframe) whenever it changes.
 */
export type TryState = {
  banner: string;
  bannerOn: boolean;
  /** menu item ids that are sold out */
  sold: string[];
  closures: Closure[];
  /** made-up request ids the visitor has marked handled */
  handled: string[];
};

export type TryMessage =
  | { type: "lg-try:state"; state: TryState; focus?: string }
  | { type: "lg-try:ready" };

export const STORE_KEY = "lg-try";
/** sandbox changes are forgotten after an hour */
export const STORE_TTL = 60 * 60 * 1000;
export const BANNER_MAX = 140;

export function initialState(site: SiteData): TryState {
  return {
    banner: site.banner ?? "",
    bannerOn: Boolean(site.banner),
    sold: site.menu.flatMap((s) => s.items).filter((i) => i.soldOut).map((i) => i.id),
    closures: [...site.closures],
    handled: [],
  };
}

/** The demo site with the visitor's sandbox changes laid over it. */
export function applyState(site: SiteData, st: TryState): SiteData {
  const sold = new Set(st.sold);
  return {
    ...site,
    banner: st.bannerOn && st.banner.trim() ? st.banner.trim().slice(0, BANNER_MAX) : undefined,
    closures: [...st.closures].sort((a, b) => a.date.localeCompare(b.date)),
    menu: site.menu.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i, soldOut: sold.has(i.id) })) })),
  };
}

/** Accept only a well-formed state (it comes from storage or another frame). */
export function cleanState(v: unknown, fallback: TryState): TryState {
  if (!v || typeof v !== "object") return fallback;
  const o = v as Record<string, unknown>;
  const strs = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === "string").slice(0, 200) : []);
  const closures = Array.isArray(o.closures)
    ? o.closures
        .filter((c): c is Closure => !!c && typeof c === "object" && /^\d{4}-\d{2}-\d{2}$/.test(String((c as Closure).date)) && typeof (c as Closure).label === "string")
        .map((c) => ({ date: c.date, label: c.label.slice(0, 60) }))
        .slice(0, 40)
    : fallback.closures;
  return {
    banner: typeof o.banner === "string" ? o.banner.slice(0, BANNER_MAX) : fallback.banner,
    bannerOn: typeof o.bannerOn === "boolean" ? o.bannerOn : fallback.bannerOn,
    sold: Array.isArray(o.sold) ? strs(o.sold) : fallback.sold,
    closures,
    handled: strs(o.handled),
  };
}
