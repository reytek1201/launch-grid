import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { getSiteData } from "@/lib/config";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BackToTop } from "@/components/site/BackToTop";
import { SiteFooter } from "@/components/site/SiteFooter";
import { TabBar } from "@/components/site/TabBar";
import { CandleCursorLoader } from "@/components/site/CandleCursorLoader";
import { MealProvider } from "@/components/motion/Meal";
import { PaperDefs } from "@/components/site/PaperDefs";
import { JsonLd } from "@/components/site/JsonLd";
import { restaurantLd, siteUrl } from "@/lib/seo";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const source = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteData();
  return {
    title: { default: site.name, template: `%s · ${site.name}` },
    description: `${site.tagline} ${site.blurb}`,
    applicationName: site.name,
    appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
    metadataBase: new URL(siteUrl()),
    alternates: { canonical: "./" },
    openGraph: { type: "website", siteName: site.name, locale: "en_US" },
    twitter: { card: "summary_large_image" },
    // The demo stays out of search results; a live client site is indexable.
    robots: site.isDemo ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#1a100b", viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteData();
  return (
    <html lang="en" className={`${fraunces.variable} ${source.variable} ${caveat.variable}`}>
      <body className="min-h-screen antialiased">
        <JsonLd data={restaurantLd(site, siteUrl())} />
        <PaperDefs />
        <MealProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream">Skip to content</a>
        <SiteHeader site={site} />
        {children}
        <SiteFooter site={site} />
        <BackToTop />
        <TabBar site={site} />
        <CandleCursorLoader />
        </MealProvider>
      </body>
    </html>
  );
}
