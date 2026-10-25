import { requireAdmin } from "@/lib/admin";
import { addSection, addWine, deleteRow, saveSection, saveWine, setPick, setSoldOut } from "../actions";
import { Arrows, HideButton } from "../controls";
import { CloseDetails } from "../CloseDetails";
import { Submit } from "../submit";
import { Banner, btn, btnDanger, btnPrimary, Card, Field, input, PageHead, SwitchLabel } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cellar" };

type Wine = { id: string; section_id: string; name: string; producer: string; region: string; grape: string | null; vintage: number | null; glass_cents: number | null; bottle_cents: number | null; notes: string | null; pairs: string[]; organic: boolean; sold_out: boolean; pick: boolean; hidden: boolean };
type Section = { id: string; title: string; note: string | null; hidden: boolean };
type Dish = { id: string; name: string; section_id: string };

const dollars = (c: number | null) => (c === null ? "" : (c / 100).toFixed(c % 100 === 0 ? 0 : 2));

function WineFields({ wine, dishes }: { wine?: Wine; dishes: Dish[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name" className="sm:col-span-2"><input required name="name" defaultValue={wine?.name} className={input} maxLength={140} /></Field>
      <Field label="Producer"><input required name="producer" defaultValue={wine?.producer} className={input} maxLength={80} /></Field>
      <Field label="Region"><input required name="region" defaultValue={wine?.region} className={input} maxLength={60} /></Field>
      <Field label="Grape"><input name="grape" defaultValue={wine?.grape ?? ""} className={input} maxLength={80} /></Field>
      <Field label="Vintage (empty if none)"><input name="vintage" inputMode="numeric" defaultValue={wine?.vintage ?? ""} placeholder="2022" className={input} maxLength={4} /></Field>
      <Field label="Glass price in dollars"><input name="glass" inputMode="decimal" defaultValue={dollars(wine?.glass_cents ?? null)} className={input} /></Field>
      <Field label="Bottle price in dollars"><input name="bottle" inputMode="decimal" defaultValue={dollars(wine?.bottle_cents ?? null)} className={input} /></Field>
      <Field label="Tasting notes" className="sm:col-span-2"><textarea name="notes" defaultValue={wine?.notes ?? ""} rows={2} className={input} maxLength={300} /></Field>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-espresso/25 px-3 text-sm has-[:checked]:border-olive has-[:checked]:bg-olive/10"><input type="checkbox" name="organic" defaultChecked={wine?.organic} className="accent-[#4F5E2F]" />Organic</label>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-espresso/25 px-3 text-sm has-[:checked]:border-terracotta-deep has-[:checked]:bg-terracotta/10"><input type="checkbox" name="pick" defaultChecked={wine?.pick} className="accent-[#9A3F20]" />On the Il Consiglio board</label>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm text-espresso/80">Goes with</legend>
        <div className="mt-1 flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
          {dishes.map((d) => (
            <label key={d.id} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-espresso/20 px-3 text-sm has-[:checked]:border-wine has-[:checked]:bg-wine/10">
              <input type="checkbox" name="pairs" value={d.id} defaultChecked={wine?.pairs.includes(d.id)} className="accent-[#6E2233]" />
              {d.name.length > 34 ? `${d.name.slice(0, 32)}…` : d.name}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default async function CellarAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { error } = await searchParams;
  const [secs, ws, ds] = await Promise.all([
    supabase.from("wine_sections").select("*").order("sort").order("id"),
    supabase.from("wines").select("*").order("sort").order("id"),
    supabase.from("menu_items").select("id,name,section_id").order("sort").order("id"),
  ]);
  const sections = (secs.data ?? []) as Section[];
  const wines = (ws.data ?? []) as Wine[];
  const dishes = (ds.data ?? []) as Dish[];
  const soldOut = wines.filter((w) => w.sold_out).length;

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:pt-8">
      <PageHead title="Cellar" sub={`Mark a bottle finito when the last one is poured. The site updates straight away.${soldOut ? ` ${soldOut} finito now.` : ""}`} />
      <Banner error={error} />

      <nav aria-label="Sections" className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-espresso/20 px-3 text-sm text-espresso/80 hover:border-espresso">{s.title}</a>)}
        <a href="#new-section" className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-dashed border-espresso/35 px-3 text-sm text-espresso/70">+ Section</a>
      </nav>

      <div className="mt-5 space-y-5">
        {sections.map((s, si) => {
          const list = wines.filter((w) => w.section_id === s.id);
          return (
            <Card key={s.id} className="scroll-mt-20">
              <div id={s.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-heading text-2xl font-semibold leading-tight">{s.title}{s.hidden && <span className="ml-2 align-middle rounded-full bg-espresso/10 px-2 py-0.5 text-xs font-sans font-normal">Hidden</span>}</h2>
                  {s.note && <p className="text-sm text-espresso/70">{s.note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Arrows table="wine_sections" id={s.id} first={si === 0} last={si === sections.length - 1} what={`section ${s.title}`} />
                  <HideButton table="wine_sections" id={s.id} hidden={s.hidden} what={`section ${s.title}`} />
                </div>
              </div>

              <details className="mt-3 rounded-xl border border-espresso/10 bg-white/40 p-3">
                <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">Rename or delete this section</summary>
                <form action={saveSection.bind(null, "wine_sections", s.id)} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Section name"><input required name="title" defaultValue={s.title} className={input} maxLength={60} /></Field>
                  <Field label="Note under the title"><input name="note" defaultValue={s.note ?? ""} className={input} maxLength={120} /></Field>
                  <div className="sm:col-span-2"><Submit className={btnPrimary}>Save section</Submit></div>
                </form>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-espresso/75">Delete section…</summary>
                  <p className="mt-2 text-sm text-wine">This also deletes its {list.length} {list.length === 1 ? "wine" : "wines"}.</p>
                  <form action={deleteRow.bind(null, "wine_sections", s.id)} className="mt-2"><Submit busy="…" className={btnDanger}>Delete {s.title} for good</Submit></form>
                </details>
                <div className="mt-4 flex justify-end"><CloseDetails /></div>
              </details>

              <ul className="mt-4 divide-y divide-dashed divide-espresso/20">
                {list.map((w, n) => (
                  <li key={w.id} id={w.id} className={`py-4 ${w.hidden ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`font-heading text-lg leading-snug ${w.sold_out ? "line-through decoration-wine/50" : ""}`}>{w.name}{w.pick && <span className="ml-2 align-middle rounded-full bg-terracotta/15 px-2 py-0.5 text-xs font-sans text-terracotta-deep">Il Consiglio</span>}</p>
                        <p className="mt-0.5 text-sm text-espresso/70">
                          {w.producer} · {w.region}{w.vintage ? ` · ${w.vintage}` : ""}
                          {w.glass_cents !== null && ` · glass $${dollars(w.glass_cents)}`}
                          {w.bottle_cents !== null && ` · bottle $${dollars(w.bottle_cents)}`}
                          {w.hidden && " · hidden"}
                        </p>
                      </div>
                      <form action={setSoldOut.bind(null, "wines", w.id, !w.sold_out)} className="shrink-0">
                        <Submit busy="…" className="-m-1 rounded-full p-1 [touch-action:manipulation]"><span className="sr-only">{w.name}: </span><SwitchLabel on={w.sold_out} onLabel="Finito" offLabel="Pouring" /></Submit>
                      </form>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Arrows table="wines" id={w.id} first={n === 0} last={n === list.length - 1} what={w.name} />
                      <HideButton table="wines" id={w.id} hidden={w.hidden} what={w.name} />
                      <form action={setPick.bind(null, w.id, !w.pick)}><Submit busy="…" className={`${btn} !min-h-9`}>{w.pick ? "Off the board" : "To the board"}<span className="sr-only"> {w.name}</span></Submit></form>
                    </div>
                    <details className="mt-3 rounded-xl border border-espresso/10 bg-white/40 p-3">
                      <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">Edit {w.name}</summary>
                      <form action={saveWine.bind(null, w.id)} className="mt-3 space-y-3">
                        <WineFields wine={w} dishes={dishes} />
                        <Submit className={btnPrimary}>Save wine</Submit>
                      </form>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-espresso/75">Delete wine…</summary>
                        <form action={deleteRow.bind(null, "wines", w.id)} className="mt-2"><Submit busy="…" className={btnDanger}>Delete for good</Submit></form>
                      </details>
                      <div className="mt-4 flex justify-end"><CloseDetails /></div>
                    </details>
                  </li>
                ))}
                {list.length === 0 && <li className="py-6 text-center font-hand text-2xl text-espresso/75">No wines yet.</li>}
              </ul>

              <details className="mt-3 rounded-xl border border-dashed border-espresso/30 p-3">
                <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">+ Add a wine to {s.title}</summary>
                <form action={addWine.bind(null, s.id)} className="mt-3 space-y-3">
                  <WineFields dishes={dishes} />
                  <Submit busy="Adding…" className={btnPrimary}>Add wine</Submit>
                </form>
                <div className="mt-4 flex justify-end"><CloseDetails /></div>
              </details>
            </Card>
          );
        })}

        <Card className="scroll-mt-20">
          <h2 id="new-section" className="font-heading text-xl font-semibold">New section</h2>
          <form action={addSection.bind(null, "wine_sections")} className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input required name="title" placeholder="Arancioni" className={input} maxLength={60} /></Field>
            <Field label="Note (optional)"><input name="note" className={input} maxLength={120} /></Field>
            <div className="sm:col-span-2"><Submit busy="Adding…" className={btn}>Add section</Submit></div>
          </form>
        </Card>
      </div>
    </main>
  );
}
