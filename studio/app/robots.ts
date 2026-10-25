import type { MetadataRoute } from "next";
import { isLive, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return isLive()
    ? { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${siteUrl()}/sitemap.xml` }
    : { rules: [{ userAgent: "*", disallow: "/" }] };
}
