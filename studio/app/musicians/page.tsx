import type { Metadata } from "next";
import { MusiciansHero } from "@/components/MusiciansHero";
import { RtDeck } from "@/components/deck/RtDeck";
import { FunkharpDesk } from "@/components/funkharp/FunkharpDesk";
import { ShowsDesk } from "@/components/funkharp/ShowsDesk";
import { fhDisplay, fhSans, fhSerif } from "./fonts";

export const metadata: Metadata = {
  title: "For bands and artists",
  description: "Custom band and artist websites with a back office on your phone, built by Reytek.",
};

export default function Musicians() {
  return (
    <main>
      <MusiciansHero fontClass={fhDisplay.variable} />

      <section className="section rk-sec" id="reytek" aria-labelledby="rk-title">
        <div className="rk-head">
          <span className="lbl">How far it can go · My own artist site</span>
          <h2 id="rk-title">Upload a song. The site finds its beat.</h2>
          <p>This is the turntable from reytek1201.com, running here with five of my tracks. Drag the tonearm onto a groove or tap a band on the record. Grab the vinyl to scratch. Pick another track while one plays and it backspins into the next. Every beat that lights the deck was found in the audio by the site&rsquo;s back office.</p>
        </div>
        <RtDeck />
        <p className="rk-foot">Ninety-second excerpts of my own music · sound starts only when you touch the deck</p>
      </section>

      <section className={`section fh ${fhDisplay.variable} ${fhSerif.variable} ${fhSans.variable}`} id="funkharp" aria-labelledby="fh-title">
        <div className="fh-head">
          <span className="lbl">The business side · Funkharp, band client</span>
          <h2 id="fh-title">Someone writes to book you. Your phone buzzes.</h2>
          <p>This is the booking letter from Funkharp&rsquo;s site. Fill it in and seal it: the band gets an alert on their phones and the letter lands in their back office, where they also run their shows, music, videos and fan list.</p>
        </div>
        <FunkharpDesk />
      </section>

      <section className={`section fh bs ${fhDisplay.variable} ${fhSerif.variable} ${fhSans.variable}`} id="backstage" aria-labelledby="bs-title">
        <div className="fh-head">
          <span className="lbl">Backstage · what the band changes themselves</span>
          <h2 id="bs-title">Add a show from your phone. It&rsquo;s on the site before you put it away.</h2>
          <p>This is Funkharp&rsquo;s back office and their Shows page. Add a date on the phone: the ticket prints onto the site, and the soonest date becomes the big &ldquo;Next show&rdquo;. No developer, no waiting.</p>
        </div>
        <ShowsDesk />
        <p className="fh-demo" style={{ color: "rgb(243 239 230 / .7)" }}>Demo with sample dates and venues. Nothing is saved.</p>
      </section>
    </main>
  );
}
