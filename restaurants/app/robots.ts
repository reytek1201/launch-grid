import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/config";
import { siteUrl } from "@/lib/seo";

// The demo stays out of search results; a live client site opens up and points to its sitemap.
export default async function robots(): Promise<MetadataRoute.Robots> {
  if ((await getSiteData()).isDemo) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl()}/sitemap.xml` };
}
