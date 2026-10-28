import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/musicians", "/restaurants", "/start", "/privacy"].map((p) => ({ url: `${siteUrl()}${p}` }));
}
