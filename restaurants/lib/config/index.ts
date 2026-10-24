import type { SiteData } from "@/lib/types";
import { trattoria } from "@/clients/demo/fixtures/trattoria";
import images from "@/clients/demo/images.json";
import type { Photo } from "@/lib/types";

// One deploy per client: set NEXT_PUBLIC_CLIENT. Only "demo" exists so far.
export const CLIENT = process.env.NEXT_PUBLIC_CLIENT ?? "demo";

export function getSiteData(): SiteData {
  return trattoria;
}

export const photos = images as Record<string, Photo>;

export function getPhoto(key: string | undefined): Photo | undefined {
  return key ? photos[key.toLowerCase()] : undefined;
}
