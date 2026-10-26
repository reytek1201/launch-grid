"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { bandRadii, DeckEngine, type Track, type Ui } from "./engine";

const START: Ui = { motor: false, rpm: 33, pitch: 0, sel: 3, playing: -1, state: "Stopped", title: "", meta: "", ready: false, audio: "idle" };
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

/**
 * "Upload a song. The site finds its beat." The music deck from reytek1201.com, rebuilt light for this page:
 * a tilted turntable you can really scratch, a pitch fader, 33/45, a tonearm you can drag, and a waveform
 * that shows the beats found in each track. Tracks are 90-second excerpts of my own music, fetched only
 * when you press something.
 */
export function ReytekDeck() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [ui, setUi] = useState<Ui>(START);
  const root = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLDivElement>(null);
  const platter = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const arm = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const wave = useRef<HTMLCanvasElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const beat = useRef<HTMLSpanElement>(null);
  const eng = useRef<DeckEngine | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/music/tracks.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error("tracks")))).then((t: Track[]) => { if (live) setTracks(t); }).catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!tracks) return;
    const els = { root: root.current, plane: plane.current, platter: platter.current, disc: disc.current, arm: arm.current, head: head.current, wave: wave.current, time: time.current, beat: beat.current };
    if (Object.values(els).some((e) => !e)) return;
    const e = new DeckEngine(tracks, els as ConstructorParameters<typeof DeckEngine>[1], setUi);
    eng.current = e;
    return () => { e.destroy(); eng.current = null; };
  }, [tracks]);

  const t = tracks?.[ui.sel] ?? tracks?.[3] ?? null;
  const bands = tracks ? bandRadii(tracks) : [];

  return (
    <div ref={root} className="rk" data-on={ui.motor} data-grab={ui.state === "Scratching"}>
      <div className="rk-stage">
        <div ref={plane} className="rk-plane">
          <div ref={platter} className="rk-platter" aria-hidden="true">
            <div className="rk-rim" />
            <div ref={disc} className="rk-disc">
              <svg className="rk-grooves" viewBox="-100 -100 200 200">
                {[0.98, 0.9, 0.82, 0.74, 0.66, 0.58, 0.5].map((r) => <circle key={r} r={r * 100} />)}
                {bands.map((r) => <circle key={r} className="band" r={r * 100} />)}
              </svg>
              <div className="rk-label">{t && <Image key={t.slug} src={`/music/${t.label ?? t.cover}`} alt="" fill sizes="120px" />}<i /></div>
            </div>
            <div className="rk-shine" />
            <div className="rk-spindle" />
          </div>
          <div className="rk-base" aria-hidden="true"><i /></div>
          <div ref={arm} className="rk-arm" aria-hidden="true">
            <span className="rk-tube" />
            <span className="rk-cw" />
            <span ref={head} className="rk-head"><i /></span>
          </div>
          <span className="rk-led" aria-hidden="true" />
        </div>
        <p className="rk-hint" aria-hidden="true">{ui.state === "Stopped" && !ui.playing ? "Press Start, then grab the record." : "Drag the record to scratch. Drag the arm to move the needle."}</p>
      </div>

      <div className="rk-panel">
        <div className="rk-now" aria-live="polite">
          <div className="rk-cover">{t && <Image key={t.slug} src={`/music/${t.cover}`} alt="" fill sizes="64px" />}</div>
          <div className="rk-nowtx">
            <span className="rk-state"><i aria-hidden="true" />{ui.ready ? ui.state : failed ? "Couldn’t load the deck" : "Loading the deck"}</span>
            <b>{ui.title || (t ? t.title : "")}</b>
            <span className="rk-meta">{ui.meta || (t ? `${t.bpm} BPM · ${t.beats.length} beats in this excerpt` : "")}</span>
          </div>
          <span ref={time} className="rk-time" aria-hidden="true">0:00 / 0:00</span>
        </div>

        <button type="button" className="rk-wave" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); eng.current?.cueFrac((e.clientX - r.left) / r.width); }} disabled={!ui.ready}>
          <span className="sr-only">Move the needle along {ui.title || "the track"}. </span>
          <canvas ref={wave} aria-hidden="true" />
          <span ref={beat} className="rk-beat" />
        </button>

        <div className="rk-controls">
          <button type="button" className="rk-btn" aria-pressed={ui.motor} onClick={() => eng.current?.toggleMotor()} disabled={!ui.ready}>{ui.motor ? "Stop" : "Start"}</button>
          <button type="button" className="rk-btn" aria-pressed={ui.rpm === 45} onClick={() => eng.current?.toggleRpm()} disabled={!ui.ready}>{ui.rpm} rpm</button>
          <div className="rk-pitch">
            <label htmlFor="rk-pitch">Pitch <output htmlFor="rk-pitch">{ui.pitch > 0 ? "+" : ""}{ui.pitch.toFixed(1)}%</output></label>
            <input id="rk-pitch" type="range" min={-8} max={8} step={0.1} value={ui.pitch} onChange={(e) => eng.current?.setPitch(parseFloat(e.target.value))} disabled={!ui.ready} />
          </div>
          <button type="button" className="rk-btn rk-zero" onClick={() => eng.current?.zeroPitch()} disabled={!ui.ready || ui.pitch === 0}>Zero</button>
        </div>

        <ul className="rk-crate" aria-label="Tracks">
          {(tracks ?? []).map((k, i) => (
            <li key={k.slug}>
              <button type="button" aria-current={i === ui.sel} data-playing={i === ui.playing} onClick={() => eng.current?.toggleTrack(i)}>
                <span className="rk-thumb"><Image src={`/music/${k.cover}`} alt="" fill sizes="44px" /></span>
                <span className="rk-tx"><span className="t"><span className="sr-only">{i === ui.playing ? "Pause " : "Play "}</span>{k.title}</span><span className="m">{k.bpm} BPM · {fmt(k.dur)} excerpt</span></span>
                <span className="rk-ic" aria-hidden="true">{i === ui.playing ? <svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg> : <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}</span>
              </button>
            </li>
          ))}
        </ul>
        {ui.audio === "unsupported" && <p className="rk-note" role="status">This browser can’t play the deck’s sound. The record and the beats still work.</p>}
      </div>
    </div>
  );
}
