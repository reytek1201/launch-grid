"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { signOut } from "./actions";

type Section = { href: string; label: string; icon: () => ReactNode };

const Frame = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const sections: Section[] = [
  { href: "/admin", label: "Home", icon: () => <Frame><path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5" /></Frame> },
  { href: "/admin/inbox", label: "Inbox", icon: () => <Frame><path d="M3 13h5l2 3h4l2-3h5v6H3z" /><path d="M3 13 6 4h12l3 9" /></Frame> },
  { href: "/admin/menu", label: "Menu", icon: () => <Frame><path d="M6 3v6a2 2 0 0 0 4 0V3M8 11v10M17 21V3c-2.4 1.6-3.4 4-3.4 7.5H17" /></Frame> },
  { href: "/admin/cellar", label: "Cellar", icon: () => <Frame><path d="M7.5 3h9c0 5.5-1.2 8.5-4.5 8.5S7.5 8.5 7.5 3zM12 11.5V19M8 21h8" /></Frame> },
  { href: "/admin/gallery", label: "Gallery", icon: () => <Frame><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M4 18l5.5-5 4 3.5 3-2.5 3.5 3" /></Frame> },
  { href: "/admin/hours", label: "Hours", icon: () => <Frame><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Frame> },
];

const active = (path: string, href: string) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`));

function Count({ n, floating = false, on = false }: { n: number; floating?: boolean; on?: boolean }) {
  return (
    <span className={floating ? `absolute -right-2.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-espresso ${on ? "bg-cream" : "bg-[#f2b27a]"}` : "ml-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f2b27a] px-1.5 text-xs font-semibold text-espresso"}>
      <span aria-hidden>{n > 99 ? "99+" : n}</span>
      <span className="sr-only"> {n} new</span>
    </span>
  );
}

export function AdminBar({ name, newCount }: { name: string; newCount: number }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const badge = (href: string) => (href === "/admin/inbox" ? newCount : 0);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a100b] pt-[env(safe-area-inset-top)] text-cream">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-3 px-4 md:gap-x-6 md:px-5">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-heading text-2xl font-semibold leading-none">{name}</span>
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-cream/55">Admin</span>
          </Link>
          <nav aria-label="Admin" className="hidden items-center gap-1 md:flex">
            {sections.map((s) => (
              <Link key={s.href} href={s.href} aria-current={active(path, s.href) ? "page" : undefined} className={`rounded-full px-3 py-1.5 text-sm ${active(path, s.href) ? "bg-cream font-semibold text-espresso" : "text-cream/70 hover:text-cream"}`}>
                {s.label}
                {badge(s.href) > 0 && <Count n={badge(s.href)} />}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-cream/25 px-3 text-sm text-cream hover:bg-cream/10">
              <span className="sm:hidden">Site</span>
              <span className="hidden sm:inline">View site</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <form action={signOut}>
              <button type="submit" className="min-h-10 rounded-full px-3 text-sm text-cream/75 hover:text-cream">Log out</button>
            </form>
          </div>
        </div>
      </header>

      <nav aria-label="Admin" className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-white/30 bg-[#1a100b]/85 pb-[env(safe-area-inset-bottom)] text-cream shadow-[0_12px_40px_rgb(26_16_11/0.4)] backdrop-blur-xl md:hidden">
        <div className="flex">
          {sections.map((s) => {
            const on = active(path, s.href);
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href} aria-current={on ? "page" : undefined} className="relative isolate flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] [-webkit-tap-highlight-color:transparent]">
                {on && (
                  <motion.span layoutId="admin-tab-pill" className="absolute inset-1.5 -z-10 rounded-2xl bg-[linear-gradient(140deg,#9A3F20,#B9532F)]" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">
                  <Icon />
                  {badge(s.href) > 0 && <Count n={badge(s.href)} floating on={on} />}
                </span>
                {s.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
