import { photos, photoUrl } from "@/lib/config";
import { requireAdmin } from "@/lib/admin";
import { addItem, addSection, clearDishPhoto, deleteRow, saveItem, saveSection, setDishPhoto, setSoldOut } from "../actions";
import { Arrows, HideButton } from "../controls";
import { Submit } from "../submit";
import { PhotoUpload } from "./PhotoUpload";
import { Banner, btn, btnDanger, btnPrimary, Card, Field, input, PageHead, SwitchLabel } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menu" };

type Item = { id: string; section_id: string; name: string; description: string | null; price_cents: number | null; tags: string[]; sold_out: boolean; hidden: boolean; photo: string | null; photo_path: string | null; photo_alt: string | null };
type Section = { id: string; title: string; note: string | null; hidden: boolean };

const TAGS = ["vegetarian", "vegan", "gluten-free", "spicy"];
const dollars = (c: number | null) => (c === null ? "" : (c / 100).toFixed(c % 100 === 0 ? 0 : 2));
const photoKeys = Object.entries(photos).filter(([k]) => k.startsWith("d-")).sort(([a], [b]) => a.localeCompare(b));

function DishFields({ item }: { item?: Item }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name" className="sm:col-span-2"><input required name="name" defaultValue={item?.name} className={input} maxLength={120} /></Field>
      <Field label="Description" className="sm:col-span-2"><textarea name="description" defaultValue={item?.description ?? ""} rows={2} className={input} maxLength={400} /></Field>
      <Field label="Price in dollars (leave empty for market price)"><input name="price" inputMode="decimal" defaultValue={dollars(item?.price_cents ?? null)} placeholder="18" className={input} /></Field>
      <Field label="Sample photo (demo library)">
        <select name="photo" defaultValue={item?.photo ?? ""} className={input}>
          <option value="">None</option>
          {photoKeys.map(([k, p]) => <option key={k} value={k}>{k} · {p.alt.slice(0, 48)}</option>)}
        </select>
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm text-espresso/80">Marks</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <label key={t} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-espresso/25 px-3 text-sm has-[:checked]:border-terracotta-deep has-[:checked]:bg-terracotta/10">
              <input type="checkbox" name="tags" value={t} defaultChecked={item?.tags.includes(t)} className="accent-[#9A3F20]" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default async function MenuAdmin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { error } = await searchParams;
  const [secs, its] = await Promise.all([
    supabase.from("menu_sections").select("*").order("sort").order("id"),
    supabase.from("menu_items").select("*").order("sort").order("id"),
  ]);
  const sections = (secs.data ?? []) as Section[];
  const items = (its.data ?? []) as Item[];
  const soldOut = items.filter((i) => i.sold_out).length;

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:pt-8">
      <PageHead title="Menu" sub={`Flip a switch to take a dish off tonight's menu. The site updates straight away.${soldOut ? ` ${soldOut} sold out now.` : ""}`} />
      <Banner error={error} />

      <nav aria-label="Sections" className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-espresso/20 px-3 text-sm text-espresso/80 hover:border-espresso">{s.title}</a>)}
        <a href="#new-section" className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-dashed border-espresso/35 px-3 text-sm text-espresso/70">+ Section</a>
      </nav>

      <div className="mt-5 space-y-5">
        {sections.map((s, si) => {
          const list = items.filter((i) => i.section_id === s.id);
          return (
            <Card key={s.id} className="scroll-mt-20">
              <div id={s.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-heading text-2xl font-semibold leading-tight">{s.title}{s.hidden && <span className="ml-2 align-middle rounded-full bg-espresso/10 px-2 py-0.5 text-xs font-sans font-normal">Hidden</span>}</h2>
                  {s.note && <p className="text-sm text-espresso/70">{s.note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Arrows table="menu_sections" id={s.id} first={si === 0} last={si === sections.length - 1} what={`section ${s.title}`} />
                  <HideButton table="menu_sections" id={s.id} hidden={s.hidden} what={`section ${s.title}`} />
                </div>
              </div>

              <details className="mt-3 rounded-xl border border-espresso/10 bg-white/40 p-3">
                <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">Rename or delete this section</summary>
                <form action={saveSection.bind(null, "menu_sections", s.id)} className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Section name"><input required name="title" defaultValue={s.title} className={input} maxLength={60} /></Field>
                  <Field label="Note under the title"><input name="note" defaultValue={s.note ?? ""} className={input} maxLength={120} /></Field>
                  <div className="sm:col-span-2"><Submit className={btnPrimary}>Save section</Submit></div>
                </form>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-espresso/75">Delete section…</summary>
                  <p className="mt-2 text-sm text-wine">This also deletes its {list.length} {list.length === 1 ? "dish" : "dishes"}.</p>
                  <form action={deleteRow.bind(null, "menu_sections", s.id)} className="mt-2"><Submit busy="…" className={btnDanger}>Delete {s.title} for good</Submit></form>
                </details>
              </details>

              <ul className="mt-4 divide-y divide-dashed divide-espresso/20">
                {list.map((i, n) => (
                  <li key={i.id} id={i.id} className={`py-4 ${i.hidden ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`font-heading text-lg leading-snug ${i.sold_out ? "line-through decoration-wine/50" : ""}`}>{i.name}</p>
                        <p className="mt-0.5 text-sm text-espresso/70">
                          {i.price_cents === null ? "Market price" : `$${dollars(i.price_cents)}`}
                          {i.tags.length > 0 && ` · ${i.tags.join(", ")}`}
                          {i.hidden && " · hidden"}
                        </p>
                      </div>
                      <form action={setSoldOut.bind(null, "menu_items", i.id, !i.sold_out)} className="shrink-0">
                        <Submit busy="…" className="-m-1 rounded-full p-1 [touch-action:manipulation]"><span className="sr-only">{i.name}: </span><SwitchLabel on={i.sold_out} onLabel="Sold out" offLabel="On the menu" /></Submit>
                      </form>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Arrows table="menu_items" id={i.id} first={n === 0} last={n === list.length - 1} what={i.name} />
                      <HideButton table="menu_items" id={i.id} hidden={i.hidden} what={i.name} />
                    </div>
                    <details className="mt-3 rounded-xl border border-espresso/10 bg-white/40 p-3">
                      <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">Edit {i.name}</summary>
                      <div className="mt-3 rounded-xl border border-espresso/10 bg-paper p-3">
                        <h3 className="font-heading text-base font-semibold">Photo</h3>
                        <div className="mt-2">
                          <PhotoUpload
                            action={setDishPhoto.bind(null, i.id)}
                            dish={i.name}
                            alt={i.photo_alt ?? ""}
                            current={i.photo_path ? { src: photoUrl(i.photo_path), alt: i.photo_alt || i.name } : undefined}
                          />
                        </div>
                        {i.photo_path && (
                          <form action={clearDishPhoto.bind(null, i.id)} className="mt-2">
                            <Submit busy="Removing…" className={btnDanger}>Remove this photo</Submit>
                          </form>
                        )}
                      </div>
                      <form action={saveItem.bind(null, i.id)} className="mt-4 space-y-3">
                        <DishFields item={i} />
                        <Submit className={btnPrimary}>Save dish</Submit>
                      </form>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-espresso/75">Delete dish…</summary>
                        <form action={deleteRow.bind(null, "menu_items", i.id)} className="mt-2"><Submit busy="…" className={btnDanger}>Delete for good</Submit></form>
                      </details>
                    </details>
                  </li>
                ))}
                {list.length === 0 && <li className="py-6 text-center font-hand text-2xl text-espresso/75">No dishes yet.</li>}
              </ul>

              <details className="mt-3 rounded-xl border border-dashed border-espresso/30 p-3">
                <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">+ Add a dish to {s.title}</summary>
                <form action={addItem.bind(null, s.id)} className="mt-3 space-y-3">
                  <DishFields />
                  <p className="text-sm text-espresso/75">Add the dish first, then open it to upload its photo.</p>
                  <Submit busy="Adding…" className={btnPrimary}>Add dish</Submit>
                </form>
              </details>
            </Card>
          );
        })}

        <Card className="scroll-mt-20">
          <h2 id="new-section" className="font-heading text-xl font-semibold">New section</h2>
          <form action={addSection.bind(null, "menu_sections")} className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input required name="title" placeholder="Contorni" className={input} maxLength={60} /></Field>
            <Field label="Note (optional)"><input name="note" className={input} maxLength={120} /></Field>
            <div className="sm:col-span-2"><Submit busy="Adding…" className={btn}>Add section</Submit></div>
          </form>
        </Card>
      </div>
    </main>
  );
}
