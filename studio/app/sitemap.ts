import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// bump a date when that page's content really changes
const PAGES: [string, string, number][] = [
  ["/", "2026-10-27", 1],
  ["/musicians", "2026-10-27", 0.9],
  ["/restaurants", "2026-10-27", 0.9],
  ["/pricing", "2026-10-27", 0.9],
  ["/start", "2026-10-27", 0.7],
  ["/privacy", "2026-10-27", 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(([p, d, priority]) => ({ url: `${siteUrl()}${p}`, lastModified: new Date(d), priority }));
}
