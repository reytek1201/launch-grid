import { PhotoSlot } from "@/components/PhotoSlot";
import { photos } from "@/lib/config";

export const metadata = { title: "Photo contact sheet" };

export default function Photos() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-6 pb-10 pt-32">
      <h1 className="text-3xl">Photo contact sheet</h1>
      <p className="mt-2 text-espresso/70">All {Object.keys(photos).length} demo images, as the site will serve them.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(photos).map(([key, p]) => (
          <figure key={key}>
            <PhotoSlot photo={key} ratio={p.width >= p.height ? "aspect-[4/3]" : "aspect-[3/4]"} sizes="(min-width: 1024px) 33vw, 50vw" />
            <figcaption className="mt-2 text-sm"><b>{p.id}</b> · {p.width}×{p.height}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
