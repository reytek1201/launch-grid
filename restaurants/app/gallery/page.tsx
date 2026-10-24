import type { Metadata } from "next";
import { GalleryWall } from "@/components/site/GalleryWall";
import { photos } from "@/lib/config";

export const metadata: Metadata = { title: "Gallery" };

// Room, kitchen and table. Dish shots live on the menu.
const wall = ["sp-03", "sp-04", "sp-06", "sp-08", "sp-07", "sp-09", "sp-03b", "sp-12", "sp-10", "sp-11", "sp-05", "sp-01"];

export default function Gallery() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-14">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl">The gallery</h1>
        <p className="mt-3 font-hand text-2xl text-terracotta-deep">Pinned up, a little crooked, like at home.</p>
        <p className="mt-2 text-sm text-espresso/75">Images are AI-generated for this demo.</p>
      </div>
      <div className="mt-12">
        <GalleryWall photos={wall.map((k) => photos[k]).filter(Boolean)} />
      </div>
    </main>
  );
}
