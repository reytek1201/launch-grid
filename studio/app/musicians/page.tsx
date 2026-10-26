import type { Metadata } from "next";
import Link from "next/link";
import { ReytekDeck } from "@/components/deck/ReytekDeck";

export const metadata: Metadata = {
  title: "For bands and artists",
  description: "Custom band and artist websites with a back office on your phone, built by Reytek.",
};

export default function Musicians() {
  return (
    <main>
      <section className="section" style={{ borderTop: 0, paddingTop: 24 }} aria-labelledby="mu-title">
        <div className="section-head">
          <span className="label">For bands and artists</span>
          <h1 id="mu-title">A band site that doesn&rsquo;t look like a template.</h1>
          <p className="lede">Your sound, your look, and a back office on your phone for shows, music, videos and bookings.</p>
          <p><Link className="btn" href="/start?kind=band">Start a band project <span aria-hidden="true">→</span></Link></p>
        </div>
      </section>

      <section className="section" id="reytek" aria-labelledby="rk-title">
        <div className="section-head">
          <span className="label">How far it can go · My own artist site</span>
          <h2 id="rk-title">Upload a song. The site finds its beat.</h2>
          <p>This is the music deck from my own site, rebuilt for this page with five of my tracks. Press Start, grab the record and scratch it, push the pitch, or drag the arm. The ticks on the waveform are beats the site found in the audio.</p>
        </div>
        <ReytekDeck />
        <p className="pt-note">Ninety-second excerpts of my own music. Sound starts only when you press something.</p>
      </section>
    </main>
  );
}
