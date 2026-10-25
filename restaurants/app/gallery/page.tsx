import type { Metadata } from "next";
import { GalleryWall } from "@/components/site/GalleryWall";
import { photos } from "@/lib/config";
import { PageHero } from "@/themes/trattoria/pages/PageHero";

export const metadata: Metadata = { title: "Gallery" };

// Room, kitchen and table. Dish shots live on the menu.
const wall = ["sp-03", "sp-04", "sp-06", "sp-08", "sp-07", "sp-09", "sp-03b", "sp-12", "sp-10", "sp-11", "sp-05", "sp-01", "sp-13", "sp-14"];

// The limewash wall the photos are pinned to.
const LIMEWASH =
  "radial-gradient(ellipse at 20% 10%, rgb(255 230 190 / 0.35), transparent 50%), radial-gradient(ellipse at 85% 70%, rgb(120 70 30 / 0.25), transparent 55%), url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.36 0 0 0 0 0.2 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\"), linear-gradient(180deg, #c99a63, #b9854f)";

export default function Gallery() {
  return (
    <main id="main" style={{ backgroundImage: LIMEWASH }}>
      <PageHero kicker="La galleria" title="Around the room" line="Pinned to the wall, a little crooked, like at home. Images are AI-generated for this demo." photo="sp-07" focal="50% 50%" ink="glass" />
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <GalleryWall photos={wall.map((k) => photos[k]).filter(Boolean)} />
      </div>
    </main>
  );
}
