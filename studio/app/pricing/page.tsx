import type { Metadata } from "next";
import Link from "next/link";
import { ProposalDesk } from "@/components/pricing/ProposalDesk";
import { JsonLd, faqLd, studioId } from "@/lib/jsonld";
import { siteUrl } from "@/lib/site";
import { ALL_TIERS, BAND_TIERS, FAQ, PRICES_AS_OF, RESTAURANT_TIERS, usd } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing for band and restaurant websites",
  description: `Fixed prices, set in writing. Band websites from ${usd(BAND_TIERS[0].price)}, restaurant websites from ${usd(RESTAURANT_TIERS[0].price)}, each with a back office you run from your phone.`,
  alternates: { canonical: "/pricing" },
};

export default function Pricing() {
  const url = siteUrl();
  const offers = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}/pricing#service`,
    name: "Band and restaurant websites with a back office",
    provider: { "@id": studioId() },
    areaServed: { "@type": "Country", name: "United States" },
    url: `${url}/pricing`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Website packages",
      itemListElement: ALL_TIERS.map((t) => ({
        "@type": "Offer",
        name: `${t.name} (${t.kind === "band" ? "band and artist website" : "restaurant website"})`,
        description: t.blurb,
        price: t.price,
        priceCurrency: "USD",
        url: `${url}/start?kind=${t.kind}&tier=${t.id}`,
      })),
    },
  };
  return (
    <main>
      <JsonLd data={offers} />
      <JsonLd data={faqLd(FAQ)} />

      <section className="pr-top" aria-labelledby="pr-title">
        <span className="label">Pricing</span>
        <h1 id="pr-title">Fixed prices, set in writing.</h1>
        <p className="lede">Every project starts with a one-page proposal: what&rsquo;s included, the price and the launch date. Here&rsquo;s what yours could say.</p>
      </section>

      <section className="pr-desk-sec" id="packages" aria-label="Packages and prices">
        <span id="bands" className="pr-anchor" aria-hidden="true" />
        <span id="restaurants" className="pr-anchor" aria-hidden="true" />
        <h2 className="sr-only">Packages and prices</h2>
        <ProposalDesk />
      </section>

      <section className="section pr-sec" id="terms" aria-labelledby="pr-terms">
        <div className="section-head">
          <span className="label">How it works</span>
          <h2 id="pr-terms">The fine print, in plain words.</h2>
        </div>
        <dl className="pr-terms pp-sheet">
          <div><dt>Paying</dt><dd>50% to start, 50% at launch. Bands can split the build into 3 monthly payments instead, with launch after the last one.</dd></div>
          <div><dt>The care plan covers</dt><dd>Hosting, security and software updates, backups, keeping your forms and back office working, and up to 1 hour a month of small changes.</dd></div>
          <div><dt>Not covered</dt><dd>New pages, redesigns and new features. I quote them first, or charge $75 an hour for small jobs. No surprise bills.</dd></div>
          <div><dt>Annual option</dt><dd>Pay the care plan for 10 months and get 12.</dd></div>
          <div><dt>Who owns what</dt><dd>You own your domain, photos, words, music, menu and lists. I own the template and code and license it to you while you&rsquo;re on a care plan.</dd></div>
          <div><dt>Leaving</dt><dd>Any time, with 30 days&rsquo; notice. I export your lists, bookings and media and point your domain wherever you want.</dd></div>
          <div><dt>Late payments</dt><dd>30 days&rsquo; grace, then the site shows a simple holding page. Your domain and data stay yours.</dd></div>
          <div><dt>In writing</dt><dd>A one-page agreement for every build, signed before work starts. Everything else happens by email.</dd></div>
        </dl>
      </section>

      <section className="section pr-sec" id="questions" aria-labelledby="pr-faq">
        <div className="section-head"><h2 id="pr-faq">Questions about the price.</h2></div>
        <div className="faq">
          {FAQ.map(([q, a]) => <details key={q}><summary><span className="faq-cell" aria-hidden="true"><i /></span>{q}</summary><p>{a}</p></details>)}
          <p className="faq-more">Something else? Ask it in the form.</p>
        </div>
      </section>

      <section className="section pr-end" aria-labelledby="pr-end">
        <div className="section-head">
          <h2 id="pr-end">Not sure which one?</h2>
          <p>Tell me what you&rsquo;re launching. I&rsquo;ll recommend one in writing, with the price and the date.</p>
        </div>
        <div className="row"><Link className="btn" href="/start" data-track="Pricing start clicked">Start a project <span aria-hidden="true">→</span></Link></div>
        <p className="pr-fine">Prices as of {PRICES_AS_OF}. Your written proposal fixes the price for your project.</p>
      </section>
    </main>
  );
}
