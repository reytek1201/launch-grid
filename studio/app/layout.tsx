import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { RefCapture } from "@/components/StartForm";
import { Wordmark } from "@/components/Wordmark";
import { siteUrl, isLive } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-bricolage" });
const publicSans = Public_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-public" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-plex" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "LaunchGrid Studio · Websites for bands and restaurants, with a back office", template: "%s · LaunchGrid Studio" },
  description: "I build custom websites for bands, restaurants and small businesses, with a back office you run from your phone. Everything happens in writing.",
  applicationName: "LaunchGrid Studio",
  openGraph: { type: "website", siteName: "LaunchGrid Studio", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: isLive() ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F7F5EF" }, { media: "(prefers-color-scheme: dark)", color: "#0E1017" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${publicSans.variable} ${plex.variable}`}>
      <body>
        <RefCapture />
        <div className="wrap">
          <header className="site-header">
            <Link className="brand" href="/" aria-label="LaunchGrid Studio, home">
              <span className="mark-box"><Mark label={null} /></span>
              <Wordmark />
            </Link>
            <nav className="hdr-nav" aria-label="Main">
              <Link className="hdr-link" href="/musicians">For bands</Link>
              <Link className="hdr-cta" href="/start"><span className="hdr-long">Start a project</span><span className="hdr-short">Start</span></Link>
            </nav>
          </header>
          {children}
          <footer className="site-footer">
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink)" }}><Wordmark /> Studio · Atlanta</div>
              <div>reytek@launchgrid.studio</div>
            </div>
            <nav aria-label="Footer">
              <Link href="/musicians">For bands</Link>
              <Link href="/#back-office">Try the back office</Link>
              <Link href="/start">Start a project</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </footer>
        </div>
      </body>
    </html>
  );
}
