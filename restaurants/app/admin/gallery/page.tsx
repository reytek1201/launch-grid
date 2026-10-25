import { photoUrl, photos as samples } from "@/lib/config";
import { CHAPTERS } from "@/lib/gallery";
import { requireAdmin } from "@/lib/admin";
import { addGalleryPhoto, deleteRow, saveGalleryPhoto } from "../actions";
import { Arrows, HideButton } from "../controls";
import { CloseDetails } from "../CloseDetails";
import { PhotoUpload } from "../menu/PhotoUpload";
import { Submit } from "../submit";
import {
  Banner,
  btnDanger,
  btnPrimary,
  Card,
  Field,
  input,
  PageHead,
} from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery" };

const src = (path: string) =>
  path.startsWith("sample:")
    ? (samples[path.slice(7)]?.src ?? "")
    : photoUrl(path);

function ChapterPick({ value = "nuove" }: { value?: string }) {
  return (
    <Field label="Which sign does it hang under?">
      <select name="chapter" defaultValue={value} className={input}>
        {CHAPTERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </Field>
  );
}

type Photo = {
  id: string;
  path: string;
  chapter: string;
  alt: string | null;
  caption: string | null;
  width: number;
  height: number;
  hidden: boolean;
};

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await searchParams;
  const { data } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("sort")
    .order("id");
  const list = (data ?? []) as Photo[];

  return (
    <main
      id="main"
      className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 md:pt-8"
    >
      <PageHead
        title="Gallery"
        sub="Every photo on the Gallery page. Each hangs under its sign, in this order. Hide one to take it down, or add your own."
      />
      <Banner error={error} />

      <Card className="mt-5">
        <h2 className="font-heading text-xl font-semibold">Add a photo</h2>
        <div className="mt-3">
          <PhotoUpload
            key={list.length}
            action={addGalleryPhoto}
            dish="the new gallery photo"
            fit
            submitLabel="Add to the gallery"
            extra={<ChapterPick />}
          />
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="font-heading text-xl font-semibold">
          On the Gallery page{list.length ? ` (${list.length})` : ""}
        </h2>
        {list.length === 0 ? (
          <p className="mt-4 text-center font-hand text-3xl text-espresso/75">
            No photos yet. The built-in ones show until you add one.
          </p>
        ) : (
          <>
            {CHAPTERS.map((c) => {
              const group = list.filter((g) => g.chapter === c.id);
              if (group.length === 0) return null;
              return (
                <div key={c.id} className="mt-5 first:mt-3">
                  <h3 className="font-hand text-3xl leading-none text-terracotta-deep">
                    {c.title}
                  </h3>
                  <ul className="mt-1 divide-y divide-dashed divide-espresso/20">
                    {group.map((g, n) => (
                      <li key={g.id} id={g.id} className="py-4">
                        <div className="flex items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element -- a small thumbnail of the live file, in the admin */}
                          <img
                            src={src(g.path)}
                            alt={g.alt || g.caption || ""}
                            width={g.width}
                            height={g.height}
                            className={`h-20 w-20 shrink-0 rounded-lg border border-espresso/15 bg-espresso/5 object-cover ${g.hidden ? "opacity-40 grayscale" : ""}`}
                          />
                          <div className="min-w-0">
                            <p className="font-hand text-2xl leading-tight">
                              {g.caption}
                            </p>
                            <p className="mt-0.5 text-sm text-espresso/70">
                              {g.hidden
                                ? "Hidden from the site"
                                : `Position ${n + 1}`}
                              {!g.alt && " · no description yet"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Arrows
                            table="gallery_photos"
                            id={g.id}
                            first={n === 0}
                            last={n === group.length - 1}
                            what={g.caption ?? "photo"}
                          />
                          <HideButton
                            table="gallery_photos"
                            id={g.id}
                            hidden={g.hidden}
                            what={g.caption ?? "photo"}
                          />
                        </div>
                        <details className="mt-3 rounded-xl border border-espresso/10 bg-white/40 p-3">
                          <summary className="cursor-pointer text-sm font-medium text-terracotta-deep">
                            Edit caption and description
                          </summary>
                          <form
                            action={saveGalleryPhoto.bind(null, g.id)}
                            className="mt-3 space-y-3"
                          >
                            <ChapterPick value={g.chapter} />
                            <Field label="Caption (up to 80 characters)">
                              <input
                                required
                                name="caption"
                                defaultValue={g.caption ?? ""}
                                maxLength={80}
                                className={input}
                              />
                            </Field>
                            <Field label="Photo description (read aloud for blind visitors)">
                              <textarea
                                name="alt"
                                defaultValue={g.alt ?? ""}
                                rows={5}
                                maxLength={300}
                                className={`${input} field-sizing-content min-h-32`}
                              />
                            </Field>
                            <Submit busy="Saving…" className={btnPrimary}>
                              Save
                            </Submit>
                          </form>
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-espresso/75">
                              Delete photo…
                            </summary>
                            <form
                              action={deleteRow.bind(
                                null,
                                "gallery_photos",
                                g.id,
                              )}
                              className="mt-2"
                            >
                              <Submit busy="…" className={btnDanger}>
                                Delete for good
                              </Submit>
                            </form>
                          </details>
                          <div className="mt-4 flex justify-end">
                            <CloseDetails />
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </>
        )}
      </Card>
    </main>
  );
}
