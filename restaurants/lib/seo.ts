import type { SiteData } from "./types";

/** Public origin of the deployed site, used for canonical URLs, the sitemap and structured data. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3100")).replace(/\/$/, "");
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const e164 = (phone: string) => `+1${phone.replace(/\D/g, "")}`;

const upcoming = (site: SiteData) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: site.timezone }).format(new Date());
  return site.closures.filter((c) => c.date >= today);
};

/** schema.org Restaurant: what Google reads for the knowledge panel, hours and "reserve" links. */
export function restaurantLd(site: SiteData, base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${base}/#restaurant`,
    name: site.name,
    description: `${site.tagline} ${site.blurb}`,
    url: base,
    image: [`${base}/opengraph-image.jpg`],
    telephone: e164(site.phone),
    email: site.email,
    servesCuisine: ["Italian"],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "US",
    },
    // A closed weekday is spelled out (opens and closes both 00:00), as Google's documentation shows.
    openingHoursSpecification: site.hours.flatMap((d) =>
      d.intervals.length
        ? d.intervals.map((i) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[d.day], opens: i.open, closes: i.close }))
        : [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[d.day], opens: "00:00", closes: "00:00" }],
    ),
    // Only closures still ahead: a date that has passed is noise.
    specialOpeningHoursSpecification: upcoming(site).map((c) => ({
      "@type": "OpeningHoursSpecification",
      validFrom: c.date,
      validThrough: c.date,
      opens: "00:00",
      closes: "00:00",
    })),
    hasMenu: `${base}/menu`,
    acceptsReservations: site.links?.reserve ?? `${base}/reserve`,
    ...(site.links?.order ? { potentialAction: { "@type": "OrderAction", target: { "@type": "EntryPoint", urlTemplate: site.links.order, actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"] } } } : {}),
  };
}

const DIET: Record<string, string> = {
  vegetarian: "https://schema.org/VegetarianDiet",
  vegan: "https://schema.org/VeganDiet",
  "gluten-free": "https://schema.org/GlutenFreeDiet",
};

/** schema.org Menu with sections, items, prices and diets. Sections with no items are left out. */
export function menuLd(site: SiteData, base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${site.name} menu`,
    url: `${base}/menu`,
    inLanguage: "en",
    hasMenuSection: site.menu
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        "@type": "MenuSection",
        name: s.title,
        ...(s.note ? { description: s.note } : {}),
        hasMenuItem: s.items.map((i) => ({
          "@type": "MenuItem",
          name: i.name,
          ...(i.description ? { description: i.description } : {}),
          ...(i.price !== null ? { offers: { "@type": "Offer", price: (i.price / 100).toFixed(2), priceCurrency: "USD" } } : {}),
          ...(i.tags?.some((t) => DIET[t]) ? { suitableForDiet: i.tags.filter((t) => DIET[t]).map((t) => DIET[t]) } : {}),
        })),
      })),
  };
}
