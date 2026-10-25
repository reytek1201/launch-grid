import type { Metadata } from "next";
import { getSiteData, photos } from "@/lib/config";
import { CHAPTERS } from "@/lib/gallery";
import { PageHero } from "@/themes/trattoria/pages/PageHero";
import { GalleryLine, type LineChapter } from "@/themes/trattoria/pages/GalleryLine";

export const metadata: Metadata = { title: "Gallery", description: "The room, the kitchen, the cellar and the table at Trattoria Cinque Lune." };

// A short walk through the restaurant, hung on a line. Dish shots live on the menu.
const LINE: { id: string; title: string; line: string; photos: [string, string][] }[] = [
  {
    id: "sala",
    title: "La sala",
    line: "The room, from the street to the long table.",
    photos: [
      ["sp-01", "Look for the lemon trees."],
      ["sp-03", "The long table, set for Sunday."],
      ["sp-03b", "Same table, after dark."],
      ["sp-08", "The window booth. Ask for it."],
      ["sp-11", "Five lanterns, five moons."],
    ],
  },
  {
    id: "cucina",
    title: "In cucina",
    line: "Where the sauce has been going since dawn.",
    photos: [
      ["sp-04", "The oven never really goes out."],
      ["sp-06", "Rolled every morning."],
      ["sp-09", "Tomatoes, flour, patience."],
    ],
  },
  {
    id: "cantina",
    title: "La cantina",
    line: "Down the stairs, and back up with a bottle.",
    photos: [
      ["sp-07", "The bar, before service."],
      ["sp-13", "Down the stairs."],
      ["sp-14", "A first pour."],
    ],
  },
  {
    id: "tavola",
    title: "A tavola",
    line: "The best seat is the one you are in.",
    photos: [
      ["sp-05", "Set and waiting."],
      ["sp-12", "Coffee, and one more bite."],
      ["sp-10", "Last candle of the night."],
    ],
  },
];

// The limewash wall the line is strung across.
const LIMEWASH =
  "radial-gradient(ellipse at 20% 10%, rgb(255 230 190 / 0.35), transparent 50%), radial-gradient(ellipse at 85% 70%, rgb(120 70 30 / 0.25), transparent 55%), url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='4'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.36 0 0 0 0 0.2 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\"), linear-gradient(180deg, #c99a63, #b9854f)";

export default async function Gallery() {
  const site = await getSiteData();
  // From the database when the gallery has rows (the admin controls order, captions and what is hidden);
  // otherwise the built-in line above.
  const chapters: LineChapter[] = site.gallery?.length
    ? CHAPTERS.map((c) => ({ id: c.id, title: c.title, line: c.line, photos: site.gallery!.filter((g) => g.chapter === c.id) })).filter((c) => c.photos.length > 0)
    : LINE.map((c) => ({
        id: c.id,
        title: c.title,
        line: c.line,
        photos: c.photos.filter(([k]) => photos[k]).map(([k, caption]) => ({ ...photos[k], caption })),
      })).filter((c) => c.photos.length > 0);

  return (
    <main id="main" style={{ backgroundImage: LIMEWASH }}>
      <PageHero kicker="La galleria" title="Around the room" line="Hung on a line, a little crooked, like at home. Images are AI-generated for this demo." photo="sp-07" focal="50% 50%" ink="glass" />
      <GalleryLine chapters={chapters} wall={LIMEWASH} />
    </main>
  );
}
