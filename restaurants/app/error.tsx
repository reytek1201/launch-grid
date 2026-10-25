"use client";

import Link from "next/link";
import { useEffect } from "react";

// Something broke while rendering a page. Calm words, a retry, and a way out.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-espresso px-5 py-32 text-cream">
      <div className="max-w-xl text-center">
        <p className="font-hand text-3xl text-[#f2b27a] md:text-4xl">Ops</p>
        <h1 className="mt-1 text-5xl leading-[0.95] md:text-6xl">The kitchen dropped a plate.</h1>
        <p className="mt-5 text-lg text-cream/90">Something went wrong on our side. Try again, or head back to the door.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-terra">Try again</button>
          <Link href="/" className="btn btn-line-light">Back to the door</Link>
        </div>
      </div>
    </main>
  );
}
