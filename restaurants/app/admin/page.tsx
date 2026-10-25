import Link from "next/link";
import { getAdmin } from "@/lib/admin";
import { getSiteData } from "@/lib/config";
import { openStatus } from "@/lib/hours";
import { redirect } from "next/navigation";
import { setSoldOut, signOut } from "./actions";
import { ago, KIND, type Req } from "./ago";
import { Submit } from "./submit";
import { btn, Card } from "./ui";

export const dynamic = "force-dynamic";

function Tile({ href, label, value, note, hot = false }: { href: string; label: string; value: string; note: string; hot?: boolean }) {
  return (
    <Link href={href} className={`group block min-w-0 rounded-2xl border p-4transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(43_29_20/0.12)] active:scale-[0.99] ${hot ? "border-terracotta/40 bg-[linear-gradient(150deg,#fff7ea,#f6e4cf)]" : "border-espresso/10 bg-paper"}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-espresso/65">{label}</p>
      <p className="mt-2 break-words font-heading text-2xl font-semibold leading-tight text-espresso sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm text-espresso/75">{note}</p>
    </Link>
  );
}

export default async function Home() {
  const me = await getAdmin();
  if (!me) redirect("/admin/login");
  if (!me.isAdmin) {
    return (
      <main id="main" className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-heading text-3xl font-semibold">Not an admin</h1>
        <p className="mt-3 text-espresso/80">{me.email} is signed in, but is not on this restaurant&apos;s admin list.</p>
        <form action={signOut} className="mt-6"><button className={btn}>Sign out</button></form>
      </main>
    );
  }
  const { supabase } = me;
  const site = await getSiteData();
  const [reqs, newCount, dishes, wines] = await Promise.all([
    supabase.from("requests").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("menu_items").select("id,name").eq("sold_out", true).order("name"),
    supabase.from("wines").select("id,name").eq("sold_out", true).order("name"),
  ]);
  const latest = (reqs.data ?? []) as Req[];
  const fresh = newCount.count ?? 0;
  const out = [
    ...(dishes.data ?? []).map((d: { id: string; name: string }) => ({ ...d, table: "menu_items" as const })),
    ...(wines.data ?? []).map((d: { id: string; name: string }) => ({ ...d, table: "wines" as const })),
  ];

  const status = openStatus(site);
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: site.timezone, hour: "numeric", hourCycle: "h23" }).format(new Date()));
  const hello = hour < 5 ? "Buonanotte" : hour < 12 ? "Buongiorno" : hour < 18 ? "Buon pomeriggio" : "Buonasera";
  const today = new Intl.DateTimeFormat("en-US", { timeZone: site.timezone, weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const upcoming = site.closures.filter((c) => c.date >= new Intl.DateTimeFormat("en-CA", { timeZone: site.timezone }).format(new Date()))[0];

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 md:pt-8">
      <p className="font-hand text-3xl text-terracotta-deep">{hello}</p>
      <h1 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl">{today}</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile href="/admin/inbox" label="New requests" value={String(fresh)} note={fresh ? "Waiting for a reply" : "All caught up"} hot={fresh > 0} />
        <Tile href="/admin/hours" label="Kitchen" value={status.open ? "Aperto" : "Chiuso"} note={status.note} />
        <Tile href="/admin/menu" label="Sold out" value={String(out.length)} note={out.length ? "Not on tonight's menu" : "Everything is on"} />
        <Tile href="/admin/hours" label="Next closure" value={upcoming ? upcoming.label : "None"} note={upcoming ? upcoming.date : "No holidays set"} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">Latest requests</h2>
            <Link href="/admin/inbox" className="ink text-sm text-terracotta-deep">Open inbox</Link>
          </div>
          {latest.length === 0 ? (
            <p className="mt-6 text-center font-hand text-3xl text-espresso/75">Nothing yet. Buon lavoro!</p>
          ) : (
            <ul className="mt-3 divide-y divide-dashed divide-espresso/20">
              {latest.map((r) => (
                <li key={r.id}>
                  <Link href="/admin/inbox" className="flex items-start justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-[0.18em] text-espresso/75">{KIND[r.kind]}{r.status === "new" && <span className="ml-2 rounded-full bg-terracotta-deep px-2 py-0.5 text-[0.65rem] tracking-widest text-cream">New</span>}</span>
                      <span className="mt-0.5 block truncate font-heading text-lg">{r.summary}</span>
                      <span className="block truncate text-sm text-espresso/70">{r.fields.Name || r.fields.name || ""}</span>
                    </span>
                    <time dateTime={r.created_at} className="shrink-0 text-sm text-espresso/65">{ago(r.created_at)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-heading text-xl font-semibold">Sold out right now</h2>
            {out.length === 0 ? (
              <p className="mt-3 text-espresso/70">Nothing is 86&apos;d. Mark a dish sold out from the <Link href="/admin/menu" className="ink text-terracotta-deep">menu</Link>.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {out.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-wine line-through decoration-wine/50">{d.name}</span>
                    <form action={setSoldOut.bind(null, d.table, d.id, false)}><Submit busy="…" className={`${btn} !min-h-9 shrink-0`}>Bring back</Submit></form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <h2 className="font-heading text-xl font-semibold">Quick links</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/admin/menu" className={btn}>Edit the menu</Link>
              <Link href="/admin/cellar" className={btn}>Edit the wines</Link>
              <Link href="/admin/hours" className={btn}>Hours &amp; closures</Link>
              <a href="/" target="_blank" rel="noopener noreferrer" className={btn}>View the site</a>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
