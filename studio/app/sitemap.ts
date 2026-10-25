import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/start", "/privacy"].map((p) => ({ url: `${siteUrl()}${p}` }));
}
