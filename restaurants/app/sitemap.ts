import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/config";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteData();
  const base = siteUrl();
  const pages: [string, number][] = [
    ["", 1],
    ["/menu", 0.9],
    ["/reserve", 0.9],
    ["/cellar", 0.7],
    ...(site.events ? [["/events", 0.7] as [string, number]] : []),
    ...(site.story ? [["/story", 0.6] as [string, number]] : []),
    ["/visit", 0.8],
    ["/gallery", 0.5],
    ["/contact", 0.6],
  ];
  const lastModified = new Date();
  return pages.map(([path, priority]) => ({ url: `${base}${path}`, lastModified, priority }));
}
