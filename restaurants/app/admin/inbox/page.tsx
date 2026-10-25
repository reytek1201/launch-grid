import Link from "next/link";
import { getSiteData } from "@/lib/config";
import { requireAdmin } from "@/lib/admin";
import { deleteRequest, setRequestStatus } from "../actions";
import { ago, KIND, type Req } from "../ago";
import { Submit } from "../submit";
import { btn, btnDanger, btnPrimary, PageHead } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox" };

const TABS = [
  { id: "todo", label: "To do" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;
const KINDS = [{ id: "", label: "Everything" }, { id: "reservation", label: "Tables" }, { id: "event", label: "Events" }, { id: "contact", label: "Postcards" }];

const href = (show: string, kind: string) => {
  const p = new URLSearchParams();
  if (show !== "todo") p.set("show", show);
  if (kind) p.set("kind", kind);
  const q = p.toString();
  return q ? `/admin/inbox?${q}` : "/admin/inbox";
};

export default async function Inbox({ searchParams }: { searchParams: Promise<{ show?: string; kind?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.id === sp.show)?.id ?? "todo";
  const kind = KINDS.find((k) => k.id === sp.kind)?.id ?? "";

  const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(300);
  const all = (data ?? []) as Req[];
  const byKind = all.filter((r) => !kind || r.kind === kind);
  const shown = byKind.filter((r) => (tab === "all" ? true : tab === "done" ? r.status === "done" : r.status !== "done"));
  const count = (id: string) => all.filter((r) => (id === "todo" ? r.status !== "done" : id === "done" ? r.status === "done" : true)).length;
  const fresh = all.filter((r) => r.status === "new").length;
  const tz = (await getSiteData()).timezone;
  const when = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:pt-8">
      <PageHead title="Inbox" sub={fresh > 0 ? `${fresh} new ${fresh === 1 ? "request" : "requests"}` : "All caught up."} />

      <nav aria-label="Filter by status" className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <Link key={t.id} href={href(t.id, kind)} aria-current={t.id === tab ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm ${t.id === tab ? "bg-[linear-gradient(120deg,#9A3F20,#B9532F)] font-semibold text-cream shadow-[0_10px_24px_rgb(154_63_32/0.28)]" : "text-espresso/75 hover:bg-paper hover:text-espresso"}`}>
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${t.id === tab ? "bg-cream/90 text-espresso" : "bg-espresso/10"}`}>{count(t.id)}</span>
          </Link>
        ))}
      </nav>
      <nav aria-label="Filter by kind" className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {KINDS.map((k) => (
          <Link key={k.id} href={href(tab, k.id)} aria-current={k.id === kind ? "page" : undefined} className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-sm ${k.id === kind ? "border-espresso bg-espresso text-cream" : "border-espresso/20 text-espresso/75 hover:border-espresso/50"}`}>{k.label}</Link>
        ))}
      </nav>

      {error && <p role="alert" className="mt-6 text-wine">Could not load requests. Try again in a moment.</p>}

      <ul className="mt-5 space-y-3">
        {shown.map((r) => (
          <li key={r.id} className={`rounded-2xl border p-4 sm:p-5 ${r.status === "new" ? "border-terracotta/50 bg-[linear-gradient(150deg,#fff7ea,#f6e4cf)]" : "border-espresso/10 bg-paper"}`}>
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-espresso/65">
              <span>{KIND[r.kind]}{r.status === "new" && <span className="ml-2 rounded-full bg-terracotta-deep px-2 py-0.5 text-[0.65rem] tracking-widest text-cream">New</span>}{r.status === "done" && <span className="ml-2 text-olive">Done</span>}</span>
              <time dateTime={r.created_at} title={when.format(new Date(r.created_at))}>{ago(r.created_at)}</time>
            </div>
            <h2 className="mt-2 font-heading text-xl leading-snug">{r.summary}</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {Object.entries(r.fields).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="text-espresso/75">{k}</dt>
                  <dd className="min-w-0 break-words">
                    {k === "Phone" ? <a className="ink text-terracotta-deep" href={`tel:${v.replace(/[^\d+]/g, "")}`}>{v}</a> : k === "Email" ? <a className="ink text-terracotta-deep" href={`mailto:${v}`}>{v}</a> : v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-espresso/75">{when.format(new Date(r.created_at))}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {r.status !== "done" && <form action={setRequestStatus.bind(null, r.id, "done")}><Submit busy="…" className={btnPrimary}>Mark done</Submit></form>}
              {r.status === "new" && <form action={setRequestStatus.bind(null, r.id, "seen")}><Submit busy="…" className={btn}>Mark seen</Submit></form>}
              {r.status !== "new" && <form action={setRequestStatus.bind(null, r.id, "new")}><Submit busy="…" className={btn}>Reopen</Submit></form>}
              <details className="ml-auto">
                <summary className="cursor-pointer list-none text-sm text-espresso/75 hover:text-espresso">Delete…</summary>
                <form action={deleteRequest.bind(null, r.id)} className="mt-2"><Submit busy="…" className={btnDanger}>Delete for good</Submit></form>
              </details>
            </div>
          </li>
        ))}
      </ul>
      {!error && shown.length === 0 && <p className="mt-12 text-center font-hand text-3xl text-espresso/75">{tab === "todo" ? "Nothing waiting. Buon lavoro!" : "Nothing here yet."}</p>}
    </main>
  );
}
