import type { MetadataRoute } from "next";
import { getSiteData } from "@/lib/config";
import { brandOf } from "@/lib/brand";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteData();
  return {
    name: site.name,
    short_name: brandOf(site.name).main,
    description: site.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#F6EEDD",
    theme_color: "#2B1D14",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
