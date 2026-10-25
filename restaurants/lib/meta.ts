import type { Metadata } from "next";
import { getSiteData } from "@/lib/config";

/** Page metadata for the current client. A client can override a page's description in its content file (`meta`). */
export function pageMeta(title: string, page: string, fallback: (name: string) => string) {
  return async function generateMetadata(): Promise<Metadata> {
    const site = await getSiteData();
    return { title, description: site.meta?.[page] ?? fallback(site.name) };
  };
}
