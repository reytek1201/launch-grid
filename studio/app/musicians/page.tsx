import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, serviceLd } from "@/lib/jsonld";
import { MusiciansHero } from "@/components/MusiciansHero";
import { RtDeck } from "@/components/deck/RtDeck";
import { FunkharpDesk } from "@/components/funkharp/FunkharpDesk";
import { KaesoDesk } from "@/components/kaeso/KaesoDesk";
import { JosieDesk } from "@/components/josie/JosieDesk";
import { fhDisplay, fhSans, fhSerif, jcDisplay, jcText, jcType, kvDisplay, kvSans } from "./fonts";

export const metadata: Metadata = {
  title: "Band and musician websites",
  description: "Custom websites for bands and artists: shows, music, videos, a booking inbox and a fan list you update from your phone. Built by Reytek in Atlanta.",
  alternates: { canonical: "/musicians" },
};

export default function Musicians() {
  return (
    <main>
      <JsonLd data={serviceLd("/musicians", "Band and musician websites", "Website design for bands and musicians", "Custom websites for bands and artists with a phone back office for shows, music, videos and bookings.")} />
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

      <section className={`section kv ${kvDisplay.variable} ${kvSans.variable}`} id="backstage" aria-labelledby="bs-title">
        <div className="kv-head">
          <span className="lbl">Backstage · Kaeso Vance, a demo artist <em>(not a real artist)</em></span>
          <h2 id="bs-title">Add a show from your phone. It&rsquo;s on the site before you put it away.</h2>
          <p>Every artist gets their own look and the same back office. Here it&rsquo;s a hip-hop artist&rsquo;s Tour page: add a date on his phone and the flyer drops onto his site. The soonest date becomes the headliner. No developer, no waiting.</p>
        </div>
        <KaesoDesk />
        <p className="kv-demo">Demo artist with sample dates and venues. Nothing is saved.</p>
      </section>

      <section className={`section jc ${jcDisplay.variable} ${jcText.variable} ${jcType.variable}`} id="fans" aria-labelledby="jc-title">
        <div className="jc-head">
          <span className="lbl">The fan list · Josie Calloway, a demo artist <em>(not a real artist)</em></span>
          <h2 id="jc-title">Tell your fans first. Straight to their inbox.</h2>
          <p>Fans join the list on your site, and the list is yours, not a platform&rsquo;s. Join hers, then write about the new single on her phone and send it.</p>
        </div>
        <JosieDesk />
        <p className="jc-demo">Demo artist with sample fans. Nothing is sent or saved.</p>
      </section>

      <section className="section fw" id="fair" aria-labelledby="fw-title">
        <div className="section-head">
          <span className="label">Fair warning</span>
          <h2 id="fw-title">If a template is enough, use one.</h2>
          <p>Plenty of bands are fine with a template, and they cost less than a custom build. Hire me when you want a site nobody else has, with a back office shaped around how your band works.</p>
        </div>
        <ol className="fw-rider">
          <li>
            <span className="fw-k">Links in one place</span>
            <b>Linktree</b>
            <span className="fw-p">Free plan</span>
            <span className="fw-n">A single page of links you set up yourself.</span>
          </li>
          <li>
            <span className="fw-k">Band site builder</span>
            <b>Bandzoogle</b>
            <span className="fw-p">From $9.16/mo <small>billed yearly · $11 monthly</small></span>
            <span className="fw-n">Templates made for musicians. You build it.</span>
          </li>
          <li>
            <span className="fw-k">General site builder</span>
            <b>Squarespace</b>
            <span className="fw-p">From $19/mo <small>billed yearly · $25 monthly</small></span>
            <span className="fw-n">Polished templates for any kind of site. You build it.</span>
          </li>
          <li className="fw-me">
            <span className="fw-k">Custom, built with you</span>
            <b>LaunchGrid</b>
            <span className="fw-p">A fixed price in writing</span>
            <span className="fw-n">Designed around your band, with a back office on your phone. I build it.</span>
          </li>
        </ol>
        <p className="fw-src">Prices from each company&rsquo;s pricing page, checked Oct 27, 2026, and they change: <a href="https://linktr.ee/s/pricing" target="_blank" rel="noopener">Linktree<span className="sr-only"> (opens in a new tab)</span></a>, <a href="https://bandzoogle.com/pricing" target="_blank" rel="noopener">Bandzoogle<span className="sr-only"> (opens in a new tab)</span></a>, <a href="https://www.squarespace.com/pricing" target="_blank" rel="noopener">Squarespace<span className="sr-only"> (opens in a new tab)</span></a>. Lowest plan shown.</p>
      </section>

      <section className="encore" id="encore" aria-labelledby="en-title">
        <span className="en-beam" aria-hidden="true" />
        <span className="en-pool" aria-hidden="true" />
        <div className="en-in">
          <span className="en-label">Encore</span>
          <h2 id="en-title">Your band, next on the setlist.</h2>
          <p>Tell me about the band in a few lines. I reply in writing by the next business day.</p>
          <Link className="btn en-btn" href="/start?kind=band">Start a band project <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
