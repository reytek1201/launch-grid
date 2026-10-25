"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useHideOnScroll } from "@/components/motion/useHideOnScroll";
import type { SiteData } from "@/lib/types";

const tel = (phone: string) => `tel:+1${phone.replace(/\D/g, "")}`;

// Phones only (desktop has Reserve in the header). On Home it waits until you are past the door,
// where the hero already shows the same buttons.
export function CheckTray({ site }: { site: SiteData }) {
  const path = usePathname();
  const hiddenByScroll = useHideOnScroll(path);
  const [pastDoor, setPastDoor] = useState(false);

  useEffect(() => {
    const check = () => setPastDoor(window.scrollY > window.innerHeight * 0.8);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  const hidden = hiddenByScroll || (path === "/" && !pastDoor);
  const btn = "btn !px-4 !py-2.5 text-sm whitespace-nowrap flex-1";

  return (
    <aside
      aria-label="Quick actions"
      className={`fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-espresso/15 bg-paper px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${hidden ? "translate-y-full" : "translate-y-0"}`}
    >
      <Link href="/reserve" className={`${btn} btn-solid`}>Reserve</Link>
      <a href={tel(site.phone)} className={`${btn} btn-line-dark`}>Call</a>
      <Link href="/menu" className={`${btn} btn-line-dark`}>Menu</Link>
    </aside>
  );
}
