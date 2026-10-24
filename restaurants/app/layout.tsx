import type { Metadata } from "next";
import { Caveat, Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { getSiteData } from "@/lib/config";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CheckTray } from "@/components/site/CheckTray";
import { CandleCursorLoader } from "@/components/site/CandleCursorLoader";
import { MealProvider } from "@/components/motion/Meal";
import { PaperDefs } from "@/components/site/PaperDefs";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const source = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

const site = getSiteData();

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3100")),
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${source.variable} ${caveat.variable}`}>
      <body className="min-h-screen antialiased">
        <PaperDefs />
        <MealProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-espresso focus:px-4 focus:py-2 focus:text-cream">Skip to content</a>
        <SiteHeader site={site} />
        {children}
        {site.isDemo && (
          <footer className="bg-espresso px-6 pb-24 pt-6 text-center text-sm text-cream/80 md:pb-6">
            Demo restaurant, not a real business. Images are AI-generated.
          </footer>
        )}
        <CheckTray site={site} />
        <CandleCursorLoader />
        </MealProvider>
      </body>
    </html>
  );
}
