import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { getSiteData, photos } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { menuLd, siteUrl } from "@/lib/seo";
import { MenuBook } from "@/themes/trattoria/pages/MenuBook";
import { PageHero } from "@/themes/trattoria/pages/PageHero";
import type { InkName } from "@/themes/trattoria/signature/Ink";

export const metadata: Metadata = { title: "Menu", description: "Antipasti, primi, secondi and dolci at Trattoria Cinque Lune." };

const DIVIDER: Record<string, InkName> = { antipasti: "bread", primi: "fork", secondi: "plate", dolci: "cup", bevande: "glass" };
const WOOD =
  "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.025) 0 2px, transparent 2px 160px), linear-gradient(180deg, #3a2416 0%, #2b1d14 100%)";

export default async function Menu() {
  const site = await getSiteData();
  const sections = site.menu.filter((s) => s.items.length > 0);
  const library: Record<string, Photo> = { ...photos, ...site.uploads };
  const dishPhotos = Object.fromEntries(sections.flatMap((s) => s.items).filter((i) => i.photo && library[i.photo]).map((i) => [i.photo as string, library[i.photo as string]]));
  // Reverse of the cellar's pairings: up to two wines per dish, by-the-glass first.
  const cellarWines = site.cellar.flatMap((s) => s.wines).filter((w) => !w.soldOut);
  const wines = Object.fromEntries(
    sections.flatMap((s) => s.items).map((i) => [
      i.id,
      cellarWines
        .filter((w) => w.pairs?.includes(i.id))
        .sort((a, b) => Number(!!b.glass) - Number(!!a.glass))
        .slice(0, 2)
        .map((w) => ({ id: w.id, name: w.name })),
    ]),
  );

  return (
    <main id="main" style={{ backgroundImage: WOOD }}>
      <JsonLd data={menuLd(site, siteUrl())} />
      <PageHero kicker="Il menù" title="What's cooking" line="Pasta is rolled by hand each morning. The sauce has been going since dawn." photo="sp-09" focal="50% 50%" ink="olive" />

      <nav aria-label="Courses" className="sticky top-[var(--header-offset,0px)] z-20 border-y border-cream/10 bg-espresso/90 backdrop-blur transition-[top] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]">
        <ul className="mx-auto flex max-w-3xl justify-start gap-5 overflow-x-auto px-4 py-2 font-hand text-xl sm:px-6 lg:justify-center sm:py-3 sm:text-2xl">
          {sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`} className="ink whitespace-nowrap text-[#f2b27a]">{s.title}</a></li>
          ))}
        </ul>
      </nav>

      {site.links?.order && (
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 px-4 pt-8 text-center">
          <p className="font-hand text-3xl text-[#f2b27a]">Eating at home tonight?</p>
          <a href={site.links.order} target="_blank" rel="noopener noreferrer" className="btn btn-terra">Order online<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
      )}

      <MenuBook sections={sections} photos={dishPhotos} wines={wines} dividers={DIVIDER} />
    </main>
  );
}
