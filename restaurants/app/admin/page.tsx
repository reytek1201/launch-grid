import Link from "next/link";
import { redirect } from "next/navigation";
import { getSiteData } from "@/lib/config";
import { adminClient, adminConfigured } from "@/lib/supabase/server";
import { deleteRequest, setRequestStatus, signOut } from "./actions";

export const dynamic = "force-dynamic";

type Req = { id: string; kind: "reservation" | "event" | "contact"; summary: string; fields: Record<string, string>; status: "new" | "seen" | "done"; created_at: string };

const KIND = { reservation: "Table", event: "Event", contact: "Postcard" } as const;
const TABS = [
  { id: "todo", label: "To do" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;

const btn = "rounded-full border border-cream/35 px-4 py-2 text-sm text-cream transition-colors duration-[250ms] hover:border-cream active:scale-95 [touch-action:manipulation]";

function ago(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / 1440)} d ago`;
}

export default async function Inbox({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  if (!adminConfigured()) redirect("/admin/login");
  const supabase = await adminClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <main id="main" className="mx-auto max-w-sm px-6 py-24">
        <h1 className="font-heading text-3xl">Not an admin</h1>
        <p className="mt-3 text-cream/85">{auth.user.email} is signed in, but is not on this restaurant&apos;s admin list.</p>
        <form action={signOut} className="mt-6"><button className={btn}>Sign out</button></form>
      </main>
    );
  }

  const { show } = await searchParams;
  const tab = TABS.find((t) => t.id === show)?.id ?? "todo";
  const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(300);
  const all = (data ?? []) as Req[];
  const shown = all.filter((r) => (tab === "all" ? true : tab === "done" ? r.status === "done" : r.status !== "done"));
  const fresh = all.filter((r) => r.status === "new").length;
  const tz = (await getSiteData()).timezone;
  const when = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <main id="main" className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cream/70">Cinque Lune</p>
          <h1 className="font-heading text-4xl font-semibold">Inbox</h1>
          <p className="mt-1 font-hand text-2xl text-[#f2b27a]">{fresh > 0 ? `${fresh} new` : "all caught up"}</p>
        </div>
        <form action={signOut}><button className={btn}>Sign out</button></form>
      </header>

      <nav aria-label="Filter" className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <Link key={t.id} href={t.id === "todo" ? "/admin" : `/admin?show=${t.id}`} aria-current={t.id === tab ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm transition-colors duration-[250ms] ${t.id === tab ? "bg-[#f2b27a] text-espresso" : "border border-cream/30 text-cream/90 hover:border-cream"}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {error && <p role="alert" className="mt-6 text-[#f2b27a]">Could not load requests. Try again in a moment.</p>}

      <ul className="mt-6 space-y-4">
        {shown.map((r) => (
          <li key={r.id} className={`rounded-2xl border p-4 sm:p-5 ${r.status === "new" ? "border-[#f2b27a]/70 bg-[#2a1a12]" : "border-cream/15 bg-[#1f140d]"}`}>
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-cream/75">
              <span>{KIND[r.kind]}{r.status === "new" && <span className="ml-2 rounded-full bg-[#d9693f] px-2 py-0.5 text-[0.65rem] tracking-widest text-espresso">New</span>}{r.status === "done" && <span className="ml-2 text-cream/60">Done</span>}</span>
              <time dateTime={r.created_at} title={when.format(new Date(r.created_at))}>{ago(r.created_at)}</time>
            </div>
            <h2 className="mt-2 font-heading text-xl leading-snug">{r.summary}</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {Object.entries(r.fields).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6rem_1fr] gap-3">
                  <dt className="text-cream/65">{k}</dt>
                  <dd className="min-w-0 break-words">
                    {k === "Phone" ? <a className="ink text-[#f2b27a]" href={`tel:${v.replace(/[^\d+]/g, "")}`}>{v}</a> : k === "Email" ? <a className="ink text-[#f2b27a]" href={`mailto:${v}`}>{v}</a> : v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-cream/60">{when.format(new Date(r.created_at))}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {r.status !== "done" && <form action={setRequestStatus.bind(null, r.id, "done")}><button className={`${btn} !border-[#f2b27a] !text-[#f2b27a]`}>Mark done</button></form>}
              {r.status === "new" && <form action={setRequestStatus.bind(null, r.id, "seen")}><button className={btn}>Mark seen</button></form>}
              {r.status !== "new" && <form action={setRequestStatus.bind(null, r.id, "new")}><button className={btn}>Reopen</button></form>}
              <details className="ml-auto">
                <summary className="cursor-pointer list-none text-sm text-cream/60 hover:text-cream">Delete…</summary>
                <form action={deleteRequest.bind(null, r.id)} className="mt-2"><button className={`${btn} !border-[#d9693f] !text-[#f2b27a]`}>Delete for good</button></form>
              </details>
            </div>
          </li>
        ))}
      </ul>
      {!error && shown.length === 0 && <p className="mt-10 text-center font-hand text-3xl text-cream/70">{tab === "todo" ? "Nothing waiting. Buon lavoro!" : "Nothing here yet."}</p>}
    </main>
  );
}
