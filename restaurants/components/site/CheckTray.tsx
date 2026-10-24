"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHideOnScroll } from "@/components/motion/useHideOnScroll";
import type { SiteData } from "@/lib/types";

const tel = (phone: string) => `tel:+1${phone.replace(/\D/g, "")}`;

export function CheckTray({ site }: { site: SiteData }) {
  const hidden = useHideOnScroll(usePathname());
  const btn = "btn !px-4 !py-2.5 text-sm whitespace-nowrap";
  return (
    <aside
      aria-label="Quick actions"
      className={`fixed inset-x-0 bottom-0 z-40 flex transition-transform duration-300 ${hidden ? "translate-y-full" : "translate-y-0"} gap-2 border-t border-espresso/15 bg-paper px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-5 md:right-5 md:w-64 md:flex-col md:rounded-lg md:border md:p-3 md:shadow-lg`}
    >
      <p className="hidden font-hand text-2xl leading-none text-terracotta-deep md:block">Il conto, per favore?</p>
      <a href={tel(site.phone)} className={`${btn} btn-solid flex-1`}>
        <span className="md:hidden">Call to reserve</span>
        <span className="hidden md:inline">Reserve a table</span>
      </a>
      <Link href="/menu" className={`${btn} btn-line-dark flex-1`}>
        Menu
      </Link>
    </aside>
  );
}
