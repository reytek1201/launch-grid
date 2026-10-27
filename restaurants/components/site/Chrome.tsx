"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The public site's header, footer and tab bar. The admin area and the Try the admin sandbox run without them. */
export function Chrome({ before, after, children }: { before: ReactNode; after: ReactNode; children: ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/admin") || path === "/try" || path.startsWith("/try/")) return <>{children}</>;
  return (
    <>
      {before}
      {children}
      {after}
    </>
  );
}
