import type { Metadata } from "next";
import { getSiteData, photos } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { SitePreview } from "./SitePreview";

export const metadata: Metadata = {
  title: "Site preview · Try the admin",
  robots: { index: false, follow: false, nocache: true },
};

/** The public site as the sandbox sees it: real header, door sign, hours and menu, fed by the visitor's changes. */
export default async function TrySite() {
  const site = await getSiteData();
  const library: Record<string, Photo> = { ...photos, ...site.uploads };
  const items = site.menu.flatMap((s) => s.items);
  const dishPhotos = Object.fromEntries(items.filter((i) => i.photo && library[i.photo]).map((i) => [i.photo as string, library[i.photo as string]]));
  const cellarWines = site.cellar.flatMap((s) => s.wines).filter((w) => !w.soldOut);
  const wines = Object.fromEntries(
    items.map((i) => [
      i.id,
      cellarWines.filter((w) => w.pairs?.includes(i.id)).sort((a, b) => Number(!!b.glass) - Number(!!a.glass)).slice(0, 2).map((w) => ({ id: w.id, name: w.name })),
    ]),
  );
  return <SitePreview site={site} photos={dishPhotos} wines={wines} />;
}
