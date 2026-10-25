import type { Metadata } from "next";
import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { Magnetic } from "@/components/motion/Magnetic";
import { InkOnView } from "@/themes/trattoria/pages/InkOnView";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

// data-hero lets the header float over this dark page, like the other inner pages.
export default function NotFound() {
  return (
    <main id="main">
      <section data-hero className="relative isolate flex min-h-svh items-center overflow-hidden bg-espresso text-cream">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-45">
          <PhotoSlot photo="sp-03" ratio="h-full w-full" sizes="100vw" hero focal="50% 55%" className="h-full" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso via-espresso/55 to-espresso/80" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-32 md:grid-cols-[1.4fr_1fr] md:px-8">
          <div>
            <p className="font-hand text-3xl text-[#f2b27a] md:text-4xl">Errore 404</p>
            <h1 className="mt-1 text-5xl leading-[0.95] md:text-7xl">This table isn&rsquo;t set.</h1>
            <p className="mt-5 max-w-lg text-lg text-cream/90 md:text-xl">
              The page you were after has left the dining room. Let us find you a seat somewhere else.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic><Link href="/" className="btn btn-terra">Back to the door</Link></Magnetic>
              <Magnetic><Link href="/menu" className="btn btn-line-light">See the menu</Link></Magnetic>
              <Magnetic><Link href="/reserve" className="btn btn-line-light">Reserve a table</Link></Magnetic>
            </div>
          </div>
          <div aria-hidden className="mx-auto flex items-end gap-4 text-cream/80">
            <InkOnView name="fork" className="w-10 md:w-12" />
            <InkOnView name="plate" className="w-32 md:w-44" />
            <InkOnView name="knife" className="w-10 md:w-12" />
          </div>
        </div>
      </section>
    </main>
  );
}
