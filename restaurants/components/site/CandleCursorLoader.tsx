"use client";

import dynamic from "next/dynamic";

// Loaded after first paint; the page never depends on it.
const CandleCursor = dynamic(() => import("./CandleCursor"), { ssr: false });

export function CandleCursorLoader() {
  return <CandleCursor />;
}
