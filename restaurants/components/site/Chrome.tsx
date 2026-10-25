"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The public site's header, footer and tab bar. The admin area runs without them. */
export function Chrome({ before, after, children }: { before: ReactNode; after: ReactNode; children: ReactNode }) {
  if (usePathname().startsWith("/admin")) return <>{children}</>;
  return (
    <>
      {before}
      {children}
      {after}
    </>
  );
}
