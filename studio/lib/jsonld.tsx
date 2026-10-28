import { siteUrl } from "./site";

/** Structured data for search engines, rendered as a script tag (see Next's JSON-LD guide). `<` is escaped. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const studioId = () => `${siteUrl()}/#studio`;

/** Who the studio is: one person in Atlanta, reachable in writing. Nothing here that isn't on the site. */
export function studioGraph() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": studioId(),
        name: "LaunchGrid Studio",
        url: `${url}/`,
        logo: `${url}/apple-icon`,
        image: `${url}/opengraph-image`,
        description: "Custom websites for bands, musicians, restaurants, cafés and food trucks, each with a back office the owner runs from a phone.",
        email: "reytek@launchgrid.studio",
        address: { "@type": "PostalAddress", addressLocality: "Atlanta", addressRegion: "GA", addressCountry: "US" },
        areaServed: [{ "@type": "City", name: "Atlanta" }, { "@type": "Country", name: "United States" }],
        founder: { "@type": "Person", name: "Reytek", url: "https://reytek1201.com" },
        knowsAbout: ["Web design", "Band websites", "Musician websites", "Restaurant websites", "Food truck websites", "Content management"],
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url: `${url}/`,
        name: "LaunchGrid Studio",
        publisher: { "@id": studioId() },
        inLanguage: "en-US",
      },
    ],
  };
}

export function serviceLd(path: string, name: string, serviceType: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl()}${path}#service`,
    name,
    serviceType,
    description,
    url: `${siteUrl()}${path}`,
    provider: { "@id": studioId() },
    areaServed: [{ "@type": "City", name: "Atlanta" }, { "@type": "Country", name: "United States" }],
  };
}

export function faqLd(items: readonly (readonly string[])[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
