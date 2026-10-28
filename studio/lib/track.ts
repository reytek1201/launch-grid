"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

/** One call, both analytics: Vercel Web Analytics and, when NEXT_PUBLIC_GA_ID is set, Google Analytics 4. */
export function track(name: string, props?: Props) {
  vercelTrack(name, props);
  if (process.env.NEXT_PUBLIC_GA_ID && typeof window !== "undefined" && "gtag" in window) {
    // GA4 event names: lowercase with underscores ("Project form sent" -> "project_form_sent").
    sendGAEvent("event", name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), props ?? {});
  }
}
