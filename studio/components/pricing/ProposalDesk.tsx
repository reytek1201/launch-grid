"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BAND_TIERS, RESTAURANT_TIERS, usd, type Tier } from "@/lib/pricing";

type Kind = Tier["kind"];
const LISTS: Record<Kind, Tier[]> = { band: BAND_TIERS, restaurant: RESTAURANT_TIERS };
const DEFAULT: Record<Kind, string> = { band: "headliner", restaurant: "counter" };
const TIMELINE = (t: Tier) => t.facts.find(([k]) => k === "Typical timeline")?.[1];

/** The price counts from the last tier to this one; the real number is always in the DOM for readers. */
function Count({ to }: { to: number }) {
  const [shown, setShown] = useState(to);
  const from = useRef(to);
  useEffect(() => {
    const start = from.current;
    from.current = to;
    if (start === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(to); return; }
    let raf = 0; const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 520);
      setShown(Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <><span aria-hidden="true">{usd(shown)}</span><span className="sr-only">{usd(to)}</span></>;
}

/**
 * Pricing as the thing every client actually gets: a written proposal. Pick who it's for and a package,
 * and the sheet fills in on that industry's paper (a gig poster for bands, a guest check for restaurants),
 * lines that changed get a cobalt highlight, and it's signed and stamped. Sample content, real prices.
 */
export function ProposalDesk() {
  const [kind, setKind] = useState<Kind>("band");
  const [ids, setIds] = useState<Record<Kind, string>>(DEFAULT);
  const [prev, setPrev] = useState<Tier | null>(null);
  const [seen, setSeen] = useState(false);
  const desk = useRef<HTMLDivElement>(null);

  const list = LISTS[kind];
  const tier = list.find((t) => t.id === ids[kind]) ?? list[0];
  const changed = new Set(prev && prev.kind === tier.kind ? tier.facts.filter(([k, v]) => prev.facts.find(([pk]) => pk === k)?.[1] !== v).map(([k]) => k) : []);

  // /pricing#restaurants opens on the guest check
  useEffect(() => {
    const pick = () => { if (location.hash === "#restaurants") setKind("restaurant"); else if (location.hash === "#bands") setKind("band"); };
    pick();
    window.addEventListener("hashchange", pick);
    return () => window.removeEventListener("hashchange", pick);
  }, []);

  // the first fill plays when the sheet scrolls into view
  useEffect(() => {
    const el = desk.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (id: string) => { if (id === tier.id) return; setPrev(tier); setIds((x) => ({ ...x, [kind]: id })); };
  const switchKind = (k: Kind) => { if (k === kind) return; setPrev(null); setKind(k); };
  const time = TIMELINE(tier);
  const facts = tier.facts.filter(([k]) => k !== "Typical timeline");
  const poster = kind === "band";

  return (
    <div className="pz-desk" ref={desk} data-kind={kind}>
      <div className="pz-controls">
        <fieldset className="pz-pick pz-who">
          <legend className="label">Who is it for?</legend>
          {(["band", "restaurant"] as Kind[]).map((k) => (
            <label key={k} className="pz-who-opt">
              <input type="radio" name="pz-kind" value={k} checked={kind === k} onChange={() => switchKind(k)} />
              <span>{k === "band" ? "A band or artist" : "A restaurant, café or truck"}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="pz-pick pz-tiers" key={kind}>
          <legend className="label">Pick a package</legend>
          {list.map((t) => (
            <label key={t.id} className="pz-tier" data-on={t.id === tier.id || undefined}>
              <input type="radio" name={`pz-tier-${kind}`} value={t.id} checked={t.id === tier.id} onChange={() => choose(t.id)} />
              <span className="pz-tier-name">{t.name}{t.note && <em>{t.note}</em>}</span>
              <span className="pz-tier-price">{usd(t.price)}</span>
              <span className="pz-tier-blurb">{t.blurb}</span>
            </label>
          ))}
        </fieldset>

        <div className="pz-go">
          <Link className="btn" href={`/start?kind=${tier.kind}&tier=${tier.id}`} data-track={`Tier ${tier.name} chosen`}>Start with {tier.name} <span aria-hidden="true">→</span></Link>
          <p className="pz-small">Sample proposal, real prices in US dollars. Yours is written for your project.</p>
          {!poster && <p className="pz-note">Need online ordering or payments on your own site, or a sync with your register? Those aren&rsquo;t in these two. Ask in the form and I&rsquo;ll tell you in writing what&rsquo;s possible.</p>}
        </div>
        <p className="sr-only" aria-live="polite">{`${tier.name}: ${usd(tier.price)} one time, then ${usd(tier.care)} a month.`}</p>
      </div>

      <div className="pz-stage">
        <span className="pz-under u1" aria-hidden="true" />
        <span className="pz-under u2" aria-hidden="true" />
        <article className="pz" data-stock={poster ? "poster" : "check"} data-in={seen || undefined} aria-label={`Sample proposal: ${tier.name}`}>
          <span className="pp-clip" aria-hidden="true" />
          <div className="pz-fill" key={`${kind}-${tier.id}`}>
            {poster ? (
              <header className="pz-poster">
                <small>LaunchGrid Studio presents</small>
                <h3>{tier.name}</h3>
                <p>a band and artist website{time ? <> · {time}</> : null}</p>
              </header>
            ) : (
              <header className="pz-check">
                <div className="pz-check-top"><b>Guest check</b><span>Table 1 · Party of you</span></div>
                <h3>{tier.name}</h3>
                <p>a restaurant website</p>
              </header>
            )}

            <ul className="pz-lines">
              {facts.map(([k, v], i) => (
                <li key={k} style={{ ["--i" as string]: i }} data-new={changed.has(k) || undefined}>
                  <span className="pz-k">{k}</span>
                  <span className="pz-v">{v}{changed.has(k) && <span className="sr-only"> (changed)</span>}</span>
                </li>
              ))}
            </ul>

            <dl className="pz-total">
              <div><dt>Build, one time</dt><dd className="pz-big"><Count to={tier.price} /></dd></div>
              {tier.split ? <div><dt>Or in {tier.split} payments</dt><dd>{tier.split} × {usd(tier.price / tier.split)}</dd></div> : null}
              <div><dt>Care plan</dt><dd>{usd(tier.care)} / month</dd></div>
            </dl>

            <dl className="pz-terms">
              <dt>Fixed price</dt><dd>Set before work starts</dd>
              <dt>Launch date</dt><dd>{time ? `In writing (typically ${time})` : "In writing, in your proposal"}</dd>
            </dl>

            <div className="pz-sign" aria-hidden="true">
              <svg viewBox="0 0 220 60"><path pathLength="1" d="M8 42 C 18 10, 30 10, 30 34 S 44 58, 52 30 S 64 8, 70 36 C 74 52, 84 44, 90 30 C 96 18, 102 40, 110 34 C 120 26, 124 44, 136 36 C 150 26, 160 30, 176 28 S 200 22, 212 18" /></svg>
              <small>Agreed</small>
            </div>
            <span className="pz-stamp">Agreed in writing</span>
          </div>
        </article>
      </div>
    </div>
  );
}
