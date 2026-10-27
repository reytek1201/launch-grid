"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { brandOf } from "@/lib/brand";
import { hoursRows, openStatus } from "@/lib/hours";
import { price } from "@/lib/format";
import type { SiteData } from "@/lib/types";
import { btn, btnDanger, btnPrimary, Card, Field, input, PageHead, SwitchLabel } from "../admin/ui";
import { KIND, type Req } from "../admin/ago";
import { applyState, BANNER_MAX, cleanState, initialState, STORE_KEY, STORE_TTL, type TryMessage, type TryState } from "./state";

/*
 * Try the admin. The real back office's look and controls (same cards, fields, switches, top bar and phone
 * tab bar), wired to a sandbox instead of the database. The site preview beside it is the real public
 * components in an iframe; every change is posted to it at once. Nothing leaves this browser tab.
 */

type Tab = "home" | "inbox" | "menu" | "hours";
type Step = "sold" | "banner" | "closure";

const STUDIO = process.env.NEXT_PUBLIC_STUDIO_URL || "https://launchgrid.studio";

// Made-up requests so the inbox isn't empty. Never real guests. Times are fixed labels, so server and browser agree.
type DemoReq = Omit<Req, "created_at"> & { when: string };
const REQUESTS: DemoReq[] = [
  { id: "demo-1", kind: "reservation", summary: "Table for 4 · Friday 7:30 pm", fields: { Name: "Marisa D. (demo)", Party: "4", Note: "Anniversary, a quiet corner if possible" }, status: "new", when: "12 min ago" },
  { id: "demo-2", kind: "event", summary: "Rehearsal dinner · about 30 guests", fields: { Name: "Theo R. (demo)", Date: "A Saturday in spring", Note: "Family style, wine pairing" }, status: "new", when: "2 h ago" },
  { id: "demo-3", kind: "contact", summary: "Do you have a gluten-free pasta?", fields: { Name: "Priya K. (demo)", Message: "Coming with my mom next week. She can't have gluten." }, status: "seen", when: "1 d ago" },
];

const STEPS: { id: Step; tab: Tab; title: string; how: string }[] = [
  { id: "sold", tab: "menu", title: "Mark a dish sold out", how: "Menu: flip a dish's switch." },
  { id: "banner", tab: "home", title: "Post a specials banner", how: "Home: write a line and save." },
  { id: "closure", tab: "hours", title: "Add a holiday closure", how: "Hours: pick a date and name it." },
];

const Frame = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const TABS: { id: Tab; label: string; icon: () => ReactNode }[] = [
  { id: "home", label: "Home", icon: () => <Frame><path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5" /></Frame> },
  { id: "inbox", label: "Inbox", icon: () => <Frame><path d="M3 13h5l2 3h4l2-3h5v6H3z" /><path d="M3 13 6 4h12l3 9" /></Frame> },
  { id: "menu", label: "Menu", icon: () => <Frame><path d="M6 3v6a2 2 0 0 0 4 0V3M8 11v10M17 21V3c-2.4 1.6-3.4 4-3.4 7.5H17" /></Frame> },
  { id: "hours", label: "Hours", icon: () => <Frame><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Frame> },
];

/** A save button that behaves like the real one: says what it's doing, then lets go. */
function FakeSave({ busy, children, className }: { busy: boolean; children: ReactNode; className: string }) {
  return (
    <button type="submit" disabled={busy} aria-disabled={busy} className={`${className} disabled:opacity-60`}>
      {busy ? "Saving…" : children}
    </button>
  );
}

function Saved({ show }: { show: boolean }) {
  return (
    <p role="status" className={`text-sm text-olive transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
      {show ? "Saved. The site is already showing it." : ""}
    </p>
  );
}

function useSaver() {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const run = (fn: () => void) => {
    setBusy(true);
    setSaved(false);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => {
      fn();
      setBusy(false);
      setSaved(true);
      t.current = window.setTimeout(() => setSaved(false), 2600);
    }, 380);
  };
  return { busy, saved, run };
}

function Tile({ label, value, note, hot = false, onClick }: { label: string; value: string; note: string; hot?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`group block min-w-0 rounded-2xl border p-4 text-left transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(43_29_20/0.12)] active:scale-[0.99] ${hot ? "border-terracotta/40 bg-[linear-gradient(150deg,#fff7ea,#f6e4cf)]" : "border-espresso/10 bg-paper"}`}>
      <span className="block text-xs uppercase tracking-[0.18em] text-espresso/65">{label}</span>
      <span className="mt-2 block break-words font-heading text-2xl font-semibold leading-tight text-espresso sm:text-3xl">{value}</span>
      <span className="mt-2 block text-sm text-espresso/75">{note}</span>
    </button>
  );
}

const longDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export function Sandbox({ site }: { site: SiteData }) {
  const reduce = useReducedMotion();
  const start = useMemo(() => initialState(site), [site]);
  const [state, setState] = useState<TryState>(start);
  const [tab, setTab] = useState<Tab>("home");
  const [view, setView] = useState<"admin" | "site">("admin");
  const [nudge, setNudge] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const focus = useRef<string | undefined>(undefined);
  const nudgeTimer = useRef<number | undefined>(undefined);
  const restored = useRef(false);
  const brand = brandOf(site.name).main;

  // Pick up where this visitor left off, for up to an hour.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { t?: number; state?: unknown };
          if (typeof saved.t === "number" && Date.now() - saved.t < STORE_TTL) setState(cleanState(saved.state, start));
          else localStorage.removeItem(STORE_KEY);
        }
      } catch { /* private mode or blocked storage: start fresh */ }
      restored.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [start]);

  const post = useCallback((st: TryState, f?: string) => {
    const w = frame.current?.contentWindow;
    if (w) w.postMessage({ type: "lg-try:state", state: st, focus: f } satisfies TryMessage, window.location.origin);
  }, []);

  // Every change goes to the preview, and into this browser's storage.
  useEffect(() => {
    post(state, focus.current);
    focus.current = undefined;
    if (!restored.current) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ t: Date.now(), state })); } catch { /* ignore */ }
  }, [state, post]);

  // The preview asks for the state once it has loaded.
  useEffect(() => {
    const onMessage = (e: MessageEvent<TryMessage>) => {
      if (e.origin === window.location.origin && e.data?.type === "lg-try:ready") post(state);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [state, post]);

  useEffect(() => () => window.clearTimeout(nudgeTimer.current), []);

  const change = (fn: (s: TryState) => TryState, f?: string, say?: string) => {
    focus.current = f;
    setState(fn);
    if (say) {
      setNudge(say);
      window.clearTimeout(nudgeTimer.current);
      nudgeTimer.current = window.setTimeout(() => setNudge(null), 4200);
    }
  };

  const reset = () => {
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    focus.current = "top";
    setState(start);
    setTab("home");
    setNudge("Demo reset. Everything is back to how it started.");
    window.clearTimeout(nudgeTimer.current);
    nudgeTimer.current = window.setTimeout(() => setNudge(null), 3200);
  };

  const live = useMemo(() => applyState(site, state), [site, state]);
  const done: Record<Step, boolean> = {
    sold: state.sold.some((id) => !start.sold.includes(id)),
    banner: state.bannerOn && !!state.banner.trim() && (state.banner.trim() !== start.banner.trim() || !start.bannerOn),
    closure: state.closures.some((c) => !start.closures.some((s) => s.date === c.date)),
  };
  const all = STEPS.every((s) => done[s.id]);
  const requests = REQUESTS.map((r) => (state.handled.includes(r.id) ? { ...r, status: "done" as const } : r));
  const fresh = requests.filter((r) => r.status === "new").length;
  const dishes = site.menu.flatMap((s) => s.items);
  const soldList = dishes.filter((d) => state.sold.includes(d.id));
  const go = (t: Tab) => { setTab(t); setView("admin"); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); };

  return (
    <div className="min-h-svh bg-cream pb-28 text-espresso lg:pb-0">
      <aside aria-label="About this sandbox" className="bg-[#2b1d14] px-4 py-2 text-center text-[0.8rem] leading-snug text-cream/90 sm:text-sm">
        <b className="font-semibold text-[#f2b27a]">Sandbox.</b> {site.name} is a demo restaurant, not a real business. Nothing you change here is saved or seen by anyone else.
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a100b] pt-[env(safe-area-inset-top)] text-cream">
        <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 md:gap-x-6 md:px-5">
          <p className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
            <span className="font-heading text-xl font-semibold leading-none sm:text-2xl">{brand}</span>
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-cream/55 max-[380px]:hidden">Admin</span>
          </p>
          <nav aria-label="Admin" className="hidden items-center gap-1 md:flex">
            {TABS.map((s) => (
              <button key={s.id} type="button" onClick={() => go(s.id)} aria-current={tab === s.id && view === "admin" ? "page" : undefined} className={`rounded-full px-3 py-1.5 text-sm ${tab === s.id ? "bg-cream font-semibold text-espresso" : "text-cream/70 hover:text-cream"}`}>
                {s.label}
                {s.id === "inbox" && fresh > 0 && <span className="ml-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f2b27a] px-1.5 text-xs font-semibold text-espresso"><span aria-hidden>{fresh}</span><span className="sr-only"> {fresh} new</span></span>}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => setView(view === "site" ? "admin" : "site")} aria-pressed={view === "site"} aria-label={view === "site" ? "Back to the admin" : "See the site"} className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full border border-cream/25 px-3 text-sm text-cream hover:bg-cream/10 lg:hidden">
              {view === "site" ? <><span className="sm:hidden">Admin</span><span className="max-sm:hidden">Back to the admin</span></> : <><span className="sm:hidden">Site</span><span className="max-sm:hidden">See the site</span></>}
            </button>
            <button type="button" onClick={reset} aria-label="Reset demo" className="min-h-10 whitespace-nowrap rounded-full px-2.5 text-sm text-cream/75 hover:text-cream sm:px-3"><span className="sm:hidden">Reset</span><span className="max-sm:hidden">Reset demo</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-6 sm:px-6 md:pt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <main id="main" className={`min-w-0 ${view === "site" ? "max-lg:hidden" : ""}`}>
          <Card className="border-terracotta/30 bg-[linear-gradient(150deg,#fffaf0,#f6e9d6)]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-xl font-semibold">Try three things</h2>
              <p className="text-sm text-espresso/70">{STEPS.filter((s) => done[s.id]).length} of 3 done</p>
            </div>
            <ol className="mt-3 grid gap-2 sm:grid-cols-3">
              {STEPS.map((s, n) => (
                <li key={s.id}>
                  <button type="button" onClick={() => go(s.tab)} className={`flex h-full w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors duration-[250ms] ${done[s.id] ? "border-olive/40 bg-olive/10" : "border-espresso/15 bg-white/60 hover:border-espresso/40"}`}>
                    <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${done[s.id] ? "bg-olive text-cream" : "border border-espresso/30 text-espresso/70"}`}>{done[s.id] ? "✓" : n + 1}</span>
                    <span className="min-w-0">
                      <span className="block font-medium">{s.title}<span className="sr-only">{done[s.id] ? " (done)" : ""}</span></span>
                      <span className="block text-sm text-espresso/70">{s.how}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <AnimatePresence initial={false}>
              {all && (
                <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <div className="mt-4 rounded-xl bg-espresso p-4 text-cream">
                    <p className="font-hand text-3xl text-[#f2b27a]">Bravo.</p>
                    <p className="mt-1">In your real back office you can also upload photos, change prices and hours, and answer table requests from your phone. Want one for your place?</p>
                    <a href={`${STUDIO}/start?kind=restaurant`} className={`${btnPrimary} mt-3`}>Start a project</a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <div className="mt-6">
            {tab === "home" && <HomeTab site={live} state={state} fresh={fresh} requests={requests} soldList={soldList} change={change} go={go} />}
            {tab === "inbox" && <InboxTab requests={requests} change={change} />}
            {tab === "menu" && <MenuTab site={site} state={state} change={change} />}
            {tab === "hours" && <HoursTab site={live} state={state} change={change} />}
          </div>
        </main>

        <aside aria-label="Site preview" className={`lg:sticky lg:top-[4.5rem] ${view === "site" ? "" : "max-lg:hidden"}`}>
          <p className="mb-2 hidden text-center text-xs uppercase tracking-[0.18em] text-espresso/65 lg:block">The site, live</p>
          <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-[2.4rem] border-[10px] border-[#1a100b] bg-[#1a100b] shadow-[0_30px_60px_-20px_rgb(26_16_11/0.55)] max-lg:max-w-none max-lg:rounded-2xl max-lg:border-4">
            <iframe ref={frame} src="/try/site" title={`${site.name} site preview, showing your sandbox changes`} className="block h-[calc(100svh-10rem)] w-full bg-cream lg:h-[min(780px,calc(100svh-7rem))]" />
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {nudge && (
          <motion.div key={nudge} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-espresso px-4 py-3 text-sm text-cream shadow-[0_12px_40px_rgb(26_16_11/0.4)] lg:bottom-6">
            <span>{nudge}</span>
            {view === "admin" && <button type="button" onClick={() => setView("site")} className="shrink-0 rounded-full border border-cream/30 px-3 py-1.5 text-cream lg:hidden">See the site</button>}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only" role="status" aria-live="polite">{nudge ?? ""}</p>

      <nav aria-label="Admin" className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-white/30 bg-[#1a100b]/85 pb-[env(safe-area-inset-bottom)] text-cream shadow-[0_12px_40px_rgb(26_16_11/0.4)] backdrop-blur-xl md:hidden">
        <div className="flex">
          {TABS.map((s) => {
            const on = tab === s.id && view === "admin";
            const Icon = s.icon;
            return (
              <button key={s.id} type="button" onClick={() => go(s.id)} aria-current={on ? "page" : undefined} className="relative isolate flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] [-webkit-tap-highlight-color:transparent]">
                {on && <motion.span layoutId="try-tab-pill" className="absolute inset-1.5 -z-10 rounded-2xl bg-[linear-gradient(140deg,#9A3F20,#B9532F)]" transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">
                  <Icon />
                  {s.id === "inbox" && fresh > 0 && <span className={`absolute -right-2.5 -top-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-espresso ${on ? "bg-cream" : "bg-[#f2b27a]"}`}><span aria-hidden>{fresh}</span><span className="sr-only"> {fresh} new</span></span>}
                </span>
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

type Change = (fn: (s: TryState) => TryState, focus?: string, say?: string) => void;

function HomeTab({ site, state, fresh, requests, soldList, change, go }: { site: SiteData; state: TryState; fresh: number; requests: DemoReq[]; soldList: { id: string; name: string }[]; change: Change; go: (t: Tab) => void }) {
  const save = useSaver();
  const [text, setText] = useState(state.banner);
  const [on, setOn] = useState(state.bannerOn);
  useEffect(() => { const id = requestAnimationFrame(() => { setText(state.banner); setOn(state.bannerOn); }); return () => cancelAnimationFrame(id); }, [state.banner, state.bannerOn]);
  const status = openStatus(site);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: site.timezone }).format(new Date());
  const upcoming = site.closures.filter((c) => c.date >= today)[0];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.slice(0, BANNER_MAX);
    save.run(() => change((s) => ({ ...s, banner: t, bannerOn: on }), "top", on && t.trim() ? "Banner saved. It's across the top of the site now." : "Banner saved. It's off the site."));
  };

  return (
    <>
      <PageHead title="Buonasera" sub="Your back office, the way an owner sees it each day." />
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Tile label="New requests" value={String(fresh)} note={fresh ? "Waiting for a reply" : "All caught up"} hot={fresh > 0} onClick={() => go("inbox")} />
        <Tile label="Kitchen" value={status.open ? "Aperto" : "Chiuso"} note={status.note} onClick={() => go("hours")} />
        <Tile label="Sold out" value={String(soldList.length)} note={soldList.length ? "Not on tonight's menu" : "Everything is on"} onClick={() => go("menu")} />
        <Tile label="Next closure" value={upcoming ? upcoming.label : "None"} note={upcoming ? upcoming.date : "No holidays set"} onClick={() => go("hours")} />
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-semibold">Specials banner</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${site.banner ? "bg-olive/15 text-olive" : "bg-espresso/10 text-espresso/80"}`}>{site.banner ? "Showing on the site" : "Not showing"}</span>
        </div>
        <p className="mt-1 text-sm text-espresso/75">One short line across the top of every page: tonight&apos;s special, a holiday notice, a private event.</p>
        <form onSubmit={submit} className="mt-3 grid gap-3">
          <Field label={`Message (up to ${BANNER_MAX} characters)`}>
            <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, BANNER_MAX))} rows={2} maxLength={BANNER_MAX} placeholder="Tonight: ossobuco with saffron risotto. Closed Thanksgiving Day." className={`${input} field-sizing-content min-h-20`} />
          </Field>
          <p className="-mt-2 text-right text-xs text-espresso/75" aria-hidden>{text.length}/{BANNER_MAX}</p>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-espresso/25 bg-white/50 px-3.5 text-espresso has-[:checked]:border-terracotta-deep has-[:checked]:bg-terracotta/10">
            <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-5 w-5 accent-[#9A3F20]" />
            Show it on the site
          </label>
          <div className="flex flex-wrap items-center gap-3"><FakeSave busy={save.busy} className={btnPrimary}>Save banner</FakeSave><Saved show={save.saved} /></div>
        </form>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">Latest requests</h2>
            <button type="button" onClick={() => go("inbox")} className="ink text-sm text-terracotta-deep">Open inbox</button>
          </div>
          <ul className="mt-3 divide-y divide-dashed divide-espresso/20">
            {requests.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.18em] text-espresso/75">{KIND[r.kind]}{r.status === "new" && <span className="ml-2 rounded-full bg-terracotta-deep px-2 py-0.5 text-[0.65rem] tracking-widest text-cream">New</span>}</span>
                  <span className="mt-0.5 block truncate font-heading text-lg">{r.summary}</span>
                  <span className="block truncate text-sm text-espresso/70">{r.fields.Name}</span>
                </span>
                <span className="shrink-0 text-sm text-espresso/65">{r.when}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-heading text-xl font-semibold">Sold out right now</h2>
          {soldList.length === 0 ? (
            <p className="mt-3 text-espresso/70">Nothing is 86&apos;d. Mark a dish sold out from the <button type="button" onClick={() => go("menu")} className="ink text-terracotta-deep">menu</button>.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {soldList.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-wine line-through decoration-wine/50">{d.name}</span>
                  <button type="button" onClick={() => change((s) => ({ ...s, sold: s.sold.filter((x) => x !== d.id) }), d.id, `${d.name} is back on the menu.`)} className={`${btn} !min-h-9 shrink-0`}>Bring back<span className="sr-only"> {d.name}</span></button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function InboxTab({ requests, change }: { requests: DemoReq[]; change: Change }) {
  return (
    <>
      <PageHead title="Inbox" sub="Table, event and contact requests from the site. These three are made up for the demo." />
      <div className="mt-5 space-y-3">
        {requests.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-espresso/75">{KIND[r.kind]} · {r.when}{r.status === "new" && <span className="ml-2 rounded-full bg-terracotta-deep px-2 py-0.5 text-[0.65rem] tracking-widest text-cream">New</span>}{r.status === "done" && <span className="ml-2 rounded-full bg-olive/15 px-2 py-0.5 text-[0.65rem] tracking-widest text-olive">Handled</span>}</p>
                <h2 className="mt-1 font-heading text-xl font-semibold">{r.summary}</h2>
              </div>
              {r.status !== "done" ? (
                <button type="button" onClick={() => change((s) => ({ ...s, handled: [...s.handled, r.id] }), undefined, "Marked handled.")} className={`${btn} !min-h-9`}>Mark handled<span className="sr-only">: {r.summary}</span></button>
              ) : (
                <button type="button" onClick={() => change((s) => ({ ...s, handled: s.handled.filter((x) => x !== r.id) }))} className={`${btn} !min-h-9`}>Undo<span className="sr-only">: {r.summary}</span></button>
              )}
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
              {Object.entries(r.fields).map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-espresso/70">{k}</dt><dd className="text-espresso">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-espresso/70">Demo: replies aren&apos;t sent from the sandbox. In your back office, a new request also pings your phone.</p>
          </Card>
        ))}
      </div>
    </>
  );
}

function MenuTab({ site, state, change }: { site: SiteData; state: TryState; change: Change }) {
  const sold = new Set(state.sold);
  const count = state.sold.length;
  return (
    <>
      <PageHead title="Menu" sub={`Flip a switch to take a dish off tonight's menu. The site updates straight away.${count ? ` ${count} sold out now.` : ""}`} />
      <nav aria-label="Sections" className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {site.menu.map((s) => <a key={s.id} href={`#m-${s.id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-espresso/20 px-3 text-sm text-espresso/80 hover:border-espresso">{s.title}</a>)}
      </nav>
      <div className="mt-5 space-y-5">
        {site.menu.map((s) => (
          <Card key={s.id} className="scroll-mt-24">
            <div id={`m-${s.id}`} className="min-w-0 scroll-mt-24">
              <h2 className="font-heading text-2xl font-semibold leading-tight">{s.title}</h2>
              {s.note && <p className="text-sm text-espresso/70">{s.note}</p>}
            </div>
            <ul className="mt-4 divide-y divide-dashed divide-espresso/20">
              {s.items.map((i) => {
                const out = sold.has(i.id);
                return (
                  <li key={i.id} className="flex items-start justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className={`font-heading text-lg leading-snug ${out ? "line-through decoration-wine/50" : ""}`}>{i.name}</p>
                      <p className="mt-0.5 text-sm text-espresso/70">{i.price === null ? "Market price" : price(i.price)}{i.tags && i.tags.length > 0 && ` · ${i.tags.join(", ")}`}</p>
                    </div>
                    <button type="button" aria-pressed={out} onClick={() => change((st) => ({ ...st, sold: out ? st.sold.filter((x) => x !== i.id) : [...st.sold, i.id] }), i.id, out ? `${i.name} is back on the menu.` : `${i.name} is marked sold out on the site.`)} className="-m-1 shrink-0 rounded-full p-1 [touch-action:manipulation]">
                      <span className="sr-only">{i.name}: </span><SwitchLabel on={out} onLabel="Sold out" offLabel="On the menu" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
        <p className="text-center text-sm text-espresso/70">In your real back office you also edit names, prices and descriptions, reorder dishes and upload photos. The sandbox keeps to the switch.</p>
      </div>
    </>
  );
}

function HoursTab({ site, state, change }: { site: SiteData; state: TryState; change: Change }) {
  const save = useSaver();
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const [err, setErr] = useState("");
  const rows = hoursRows(site);
  const add = (e: FormEvent) => {
    e.preventDefault();
    const name = label.trim().slice(0, 60);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !name) { setErr("Pick a date and give it a name."); return; }
    if (state.closures.some((c) => c.date === date)) { setErr("That date is already closed."); return; }
    setErr("");
    save.run(() => {
      change((s) => ({ ...s, closures: [...s.closures, { date, label: name }] }), "hours", `${name} is on the site, and the door sign knows.`);
      setDate("");
      setLabel("");
    });
  };
  return (
    <>
      <PageHead title="Hours & details" sub="Opening hours drive the “open now” sign and the times guests can pick when they ask for a table." />
      <Card className="mt-6">
        <h2 className="font-heading text-xl font-semibold">Weekly hours</h2>
        <dl className="mt-3 space-y-1.5 text-sm">
          {rows.map((r) => (
            <div key={r.days} className="flex justify-between gap-4 border-b border-dashed border-espresso/15 pb-1.5">
              <dt className="font-medium">{r.days}</dt>
              <dd className="whitespace-pre-line text-right text-espresso/80">{r.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-espresso/70">Shifts are edited day by day in your real back office. The sandbox keeps them as they are.</p>
      </Card>

      <h2 className="mt-8 font-heading text-2xl font-semibold">Closures</h2>
      <Card className="mt-3">
        <p className="text-sm text-espresso/75">Holidays and private days when the doors stay shut. They show on the site and block table requests for that date.</p>
        <ul className="mt-3 divide-y divide-dashed divide-espresso/20">
          {site.closures.map((c) => (
            <li key={c.date} className="flex items-center justify-between gap-3 py-3">
              <span><span className="font-medium">{c.label}</span> <span className="text-espresso/65">· {longDate(c.date)}</span></span>
              <button type="button" onClick={() => change((s) => ({ ...s, closures: s.closures.filter((x) => x.date !== c.date) }), "hours", `${c.label} removed from the site.`)} className={`${btnDanger} !min-h-9`}>Remove<span className="sr-only"> {c.label}</span></button>
            </li>
          ))}
          {site.closures.length === 0 && <li className="py-4 text-center font-hand text-2xl text-espresso/75">No closures set.</li>}
        </ul>
        <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          <Field label="Date"><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} /></Field>
          <Field label="Name"><input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Christmas Day" className={input} maxLength={60} /></Field>
          <FakeSave busy={save.busy} className={btnPrimary}>Add closure</FakeSave>
        </form>
        {err && <p role="alert" className="mt-3 rounded-xl border border-wine/40 bg-wine/10 px-4 py-3 text-sm text-wine">{err}</p>}
        <div className="mt-2"><Saved show={save.saved} /></div>
      </Card>
    </>
  );
}
