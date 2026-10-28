"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";
import { useEffect, useRef, useState } from "react";

type Kind = "band" | "restaurant" | "other";
type Phase = "arming" | "open";

const BAYS: { kind: Kind; n: string; short: string; title: string; text: string; go: string; href: string; enter: string }[] = [
  { kind: "band", n: "01", short: "Bands", title: "Bands and artists", text: "Shows, music, videos, a booking inbox and your fan list.", go: "Start a band project", href: "/musicians", enter: "See the band sites" },
  { kind: "restaurant", n: "02", short: "Restaurants", title: "Restaurants", text: "Menu, specials, hours, reservations and photos you change yourself.", go: "Start a restaurant project", href: "/restaurants", enter: "See the restaurant sites" },
  { kind: "other", n: "03", short: "Other", title: "Other small businesses", text: "The same build and back office, shaped to what you sell. I’ll reply with the nearest fit.", go: "Tell me what you run", href: "/start?kind=other", enter: "Tell me what you run" },
];

const BULBS = Array.from({ length: 9 }, (_, i) => { const x = 6 + i * 11; const t = x / 100; return { x, y: 3 + 4 * t * (1 - t) * 13 }; });

function Room({ kind }: { kind: Kind }) {
  if (kind === "band") return (
    <span className="bay-room room-band">
      <Image src="/work/funkharp-photo.webp" alt="" fill sizes="(min-width: 760px) 330px, 33vw" />
      <span className="haze" />
      <span className="truss">{[0, 1, 2, 3].map((i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
      <i className="beam b1" /><i className="beam b2" />
      <span className="eq">{Array.from({ length: 11 }, (_, i) => <i key={i} style={{ ["--i" as string]: i }} />)}</span>
    </span>
  );
  if (kind === "restaurant") return (
    <span className="bay-room room-rest">
      <Image src="/work/cinque-lune-door.webp" alt="" fill sizes="(min-width: 760px) 330px, 33vw" />
      <span className="candle" />
      <svg className="bulbs" viewBox="0 0 100 24" preserveAspectRatio="none">
        <path d="M0 2 Q50 30 100 2" />
        {BULBS.map((b, i) => <circle key={i} cx={b.x} cy={b.y + 2.4} r="1.7" style={{ ["--i" as string]: i }} />)}
      </svg>
    </span>
  );
  return (
    <span className="bay-room room-other">
      <span className="scan" />
      <span className="cells">{Array.from({ length: 9 }, (_, i) => <i key={i} className={i === 2 ? "lift" : undefined} />)}<b className="slot" /></span>
      <span className="dims">W 36 · H 80</span>
    </span>
  );
}

/**
 * "Pick your bay." Three launch bays with steel roll-up shutters, all shut. Tap one: its lamp counts down,
 * the shutter rolls up, the lights inside come on and the bay locks in. If the visitor already picked a
 * kind in the launch sequence above, that bay opens by itself when it scrolls into view.
 */
export function Doors() {
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const chosen = useRef(false);
  const pending = useRef<Kind | null>(null);
  const [locked, setLocked] = useState<Kind | null>(null);
  const [phase, setPhase] = useState<Phase>("open");
  const router = useRouter();

  const choose = (k: Kind) => {
    chosen.current = true;
    if (k === locked) return;
    window.clearTimeout(timer.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.dispatchEvent(new CustomEvent("lg:kind", { detail: k }));
    track("Bay opened", { kind: k });
    setLocked(k);
    setPhase(reduce ? "open" : "arming");
    if (!reduce) timer.current = window.setTimeout(() => setPhase("open"), 780);
  };
  const chooseRef = useRef(choose);
  useEffect(() => { chooseRef.current = choose; });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      el.dataset.seen = String(visible || el.dataset.seen === "true");
      if (visible && pending.current && !chosen.current) { const k = pending.current; pending.current = null; window.setTimeout(() => chooseRef.current(k), 350); }
    }, { threshold: 0.45 });
    io.observe(el);
    const onKind = (ev: Event) => {
      if (chosen.current) return;
      const k = (ev as CustomEvent<Kind>).detail;
      if (visible) chooseRef.current(k); else pending.current = k;
    };
    window.addEventListener("lg:kind", onKind);
    return () => { io.disconnect(); window.removeEventListener("lg:kind", onKind); window.clearTimeout(timer.current); };
  }, []);

  const cur = BAYS.find((b) => b.kind === locked);

  return (
    <div ref={root} className="dock" data-locked={locked ?? "none"}>
      <div className="dock-wall" aria-hidden="true"><span>Launch bays</span><i /><i /><i /></div>
      <div className="bays" role="group" aria-label="Pick what you run">
        {BAYS.map((b) => {
          const state = locked === b.kind ? phase : "shut";
          return (
            <button key={b.kind} type="button" className={`bay bay-${b.kind}`} data-state={state} aria-pressed={locked === b.kind} aria-describedby={`bay-${b.kind}-d`} onClick={() => (locked === b.kind && phase === "open" ? router.push(b.href) : choose(b.kind))}>
              <span className="bay-plate" aria-hidden="true"><b>Bay {b.n}</b><span className="lamp" /></span>
              <span className="bay-door" aria-hidden="true">
                <Room kind={b.kind} />
                <span className="shutter"><span className="stencil">{b.n}</span><span className="stripe" /><span className="bar"><i /><i /></span></span>
                <span className="leak" />
                <span className="housing" />
                {state === "open" ? <span className="bay-enter">Go in <span>→</span></span> : null}
              </span>
              <span className="bay-floor" aria-hidden="true" />
              <span className="bay-name">{b.short}<span className="sr-only">: {b.title}</span>{state === "open" ? <span className="sr-only">. Open. Press again: {b.enter}</span> : null}</span>
              <span id={`bay-${b.kind}-d`} className="sr-only">{b.text}</span>
            </button>
          );
        })}
      </div>
      <div className="console">
        <p className="readout" aria-live="polite">
          <span className="dot" aria-hidden="true" />
          {cur ? <><span className="mono">Bay {cur.n} · {cur.short} · {phase === "open" ? "Locked in" : "Opening"}</span><b>{cur.title}</b><span className="txt">{cur.text}</span></>
               : <><span className="mono">All bays shut</span><b>Tap a bay to lock it in.</b><span className="txt">Bands, restaurants, or any other small business.</span></>}
        </p>
        <div className="console-go">
          <Link className="btn" href={cur ? `/start?kind=${cur.kind}` : "/start"}>{cur ? cur.go : "Start a project"} <span aria-hidden="true">→</span></Link>
          {cur?.kind === "band" && phase === "open" ? <Link className="console-more" href="/musicians">See the band sites</Link> : null}
          {cur?.kind === "restaurant" && phase === "open" ? <Link className="console-more" href="/restaurants">See the restaurant sites</Link> : null}
        </div>
      </div>
    </div>
  );
}
