import Link from "next/link";
import { address } from "@/lib/format";
import { hoursRows } from "@/lib/hours";
import type { SiteData } from "@/lib/types";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";
import { Moons } from "./Moons";
import { SOCIAL } from "./social";

const tel = (phone: string) => `tel:+1${phone.replace(/\D/g, "")}`;
const pagesFor = (site: SiteData) => [
  { href: "/reserve", label: "Reserve a table" },
  { href: "/menu", label: "Menu" },
  { href: "/cellar", label: "Wine cellar" },
  ...(site.story ? [{ href: "/story", label: "Our story" }] : []),
  ...(site.events ? [{ href: "/events", label: "Private events" }] : []),
  { href: "/visit", label: "Hours & location" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

// The back of the house: everything a guest looks for at the bottom of a page, by candlelight.
export function SiteFooter({ site }: { site: SiteData }) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address(site.address))}`;
  const head = "font-hand text-3xl text-[#f2b27a]";
  return (
    <footer className="relative bg-[#1a100b] text-cream">
      {/* Torn top edge, as if the page were a sheet laid over the table */}
      <svg aria-hidden className="absolute inset-x-0 -top-3 h-4 w-full text-[#1a100b]" viewBox="0 0 1200 16" preserveAspectRatio="none" fill="currentColor">
        <path d="M0 16 L0 9 L28 6 L52 10 L81 4 L109 8 L140 5 L168 11 L197 6 L230 9 L258 3 L290 8 L322 6 L351 10 L380 5 L414 9 L441 4 L470 8 L503 6 L531 11 L560 5 L594 8 L622 3 L655 9 L683 6 L712 10 L746 4 L773 8 L805 6 L833 11 L866 5 L894 9 L925 4 L957 8 L986 6 L1015 10 L1046 5 L1078 9 L1106 3 L1138 8 L1167 6 L1200 9 L1200 16 Z" />
      </svg>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgb(255_190_110/0.10),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-12 pt-16 md:grid-cols-2 md:px-8 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex flex-col leading-none">
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-cream/80">Trattoria</span>
              <span className="font-heading text-3xl font-semibold tracking-tight">Cinque Lune</span>
            </span>
            <Moons id="moon-foot" className="h-3 w-auto text-[#f2b27a]" />
          </Link>
          <p className="mt-4 max-w-xs text-cream/85">{site.tagline} {site.blurb.split(". ")[0]}.</p>
          <Link href="/reserve" className="btn btn-terra mt-6 inline-block">Reserve a table</Link>

          <div className="mt-8">
            <p className="font-hand text-2xl text-[#f2b27a]">Seguici</p>
            <ul aria-label="Find us on social media (profiles coming soon)" className="mt-2 flex gap-3">
              {SOCIAL.map((s) => (
                <li key={s.id}>
                  <span role="img" aria-label={s.title} title={s.title} className="grid h-11 w-11 place-items-center rounded-full border border-cream/30 text-cream/90 transition-colors duration-[250ms] hover:border-[#f2b27a] hover:text-[#f2b27a]">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d={s.path} /></svg>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className={head}>Vieni a trovarci</h2>
          <address className="mt-3 not-italic leading-relaxed text-cream/90">
            {site.address.street}<br />{site.address.city}, {site.address.state} {site.address.zip}
          </address>
          <p className="mt-3"><a href={maps} target="_blank" rel="noreferrer" className="ink">Open in Maps</a></p>
          <p className="mt-1"><a href={tel(site.phone)} className="ink">{site.phone}</a></p>
          <p className="mt-1"><a href={`mailto:${site.email}`} className="ink">{site.email}</a></p>
        </div>

        <div>
          <h2 className={head}>Orari</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            {hoursRows(site).map((r) => (
              <div key={r.days} className="flex justify-between gap-4 border-b border-dashed border-cream/15 pb-1.5">
                <dt className="text-cream/80">{r.days}</dt>
                <dd className="whitespace-pre-line text-right">{r.text}</dd>
              </div>
            ))}
          </dl>
          {site.closures[0] && <p className="mt-3 text-sm text-cream/80">Closed {new Date(`${site.closures[0].date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })} for {site.closures[0].label}.</p>}
        </div>

        <nav aria-label="Footer">
          <h2 className={head}>Esplora</h2>
          <ul className="mt-3 space-y-2">
            {pagesFor(site).map((p) => (
              <li key={p.href}><Link href={p.href} className="ink">{p.label}</Link></li>
            ))}
          </ul>
          <InkOnView name="olive" className="mt-8 hidden w-32 text-olive/80 lg:block" />
        </nav>
      </div>

      <div className="relative border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 text-sm text-cream/80 md:flex-row md:items-center md:justify-between md:px-8 md:pb-6">
          <p>© {new Date().getFullYear()} {site.name}{site.isDemo ? " · Demo restaurant, not a real business. Images are AI-generated." : ""}</p>
          <p>Site by LaunchGrid Studio</p>
        </div>
      </div>
    </footer>
  );
}
