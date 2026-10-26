/**
 * The Reytek deck, ported from reytek1201.com as a small plain-TypeScript engine (no three.js).
 * Same ideas as the original: one record side with the tracks laid out by length, a motor with real
 * spin-up and power-down, a pitch fader, 33/45, a tonearm you can drag, a platter you can grab and
 * scratch, and the original AudioWorklet that plays the track at any signed rate. All sound is
 * created only after the visitor touches something, and the worklet and tracks load on demand.
 */

export type Track = {
  slug: string; title: string; bpm: number; full: number; start: number; dur: number; gain: number;
  beats: number[]; peaks: number[]; cover: string; label: string | null; fullBeats: number;
};

export type Ui = {
  motor: boolean; rpm: 33 | 45; pitch: number; sel: number; playing: number;
  state: string; title: string; meta: string; ready: boolean; audio: "idle" | "loading" | "ok" | "unsupported";
};

export type Els = {
  root: HTMLElement; plane: HTMLElement; platter: HTMLElement; disc: HTMLElement; arm: HTMLElement; head: HTMLElement;
  wave: HTMLCanvasElement; time: HTMLElement; beat: HTMLElement;
};

const NOM = 100 / 3 / 60;                 // 33 1/3 rpm in revolutions per second
const LEAD = 2.5, GAPT = 3, RUNOUT_T = 4; // seconds of lead-in, gap between tracks, run-out
const R_LEAD = 1.465, R_OUT = 1.42, R_IN = 0.66, R_RUN = 0.56, GAP_W = 0.045, R_REC = 1.5;
const PV = { x: 2.3, z: -1.2 }, ARM_L = 2.45, PHI_REST = (97 * Math.PI) / 180;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (s: number) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

type Seg = { k: "lead" | "track" | "gap" | "run"; i?: number; t0: number; t1: number; r0: number; r1: number };
type Auto = { phi: number; t: number; drop: boolean; fast: boolean };

const stylusAt = (phi: number) => ({ x: PV.x + ARM_L * Math.cos(phi), z: PV.z + ARM_L * Math.sin(phi) });
const rAt = (phi: number) => { const s = stylusAt(phi); return Math.hypot(s.x, s.z); };
const PHI_MAX = (() => { let lo = PHI_REST, hi = PHI_REST + 1.2; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (rAt(m) > 0.5) lo = m; else hi = m; } return lo; })();
function phiForR(r: number) { let lo = PHI_REST, hi = PHI_MAX; for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (rAt(m) > r) lo = m; else hi = m; } return (lo + hi) / 2; }

/** Radii of the smooth bands between tracks, as a fraction of the record radius, for drawing the grooves. */
export function bandRadii(tracks: Track[]) {
  const { seg } = layout(tracks);
  return seg.filter((s) => s.k === "gap").map((s) => ((s.r0 + s.r1) / 2) / R_REC);
}

function layout(tracks: Track[]) {
  const seg: Seg[] = [];
  const t0s: number[] = [];
  seg.push({ k: "lead", t0: -LEAD, t1: 0, r0: R_LEAD, r1: R_OUT });
  const total = tracks.reduce((s, x) => s + x.dur, 0), span = (R_OUT - R_IN) - GAP_W * (tracks.length - 1);
  let t = 0, r = R_OUT;
  tracks.forEach((tr, i) => {
    const w = (span * tr.dur) / total;
    t0s.push(t);
    seg.push({ k: "track", i, t0: t, t1: t + tr.dur, r0: r, r1: r - w });
    t += tr.dur; r -= w;
    if (i < tracks.length - 1) { seg.push({ k: "gap", t0: t, t1: t + GAPT, r0: r, r1: r - GAP_W }); t += GAPT; r -= GAP_W; }
  });
  seg.push({ k: "run", t0: t, t1: t + RUNOUT_T, r0: r, r1: R_RUN });
  return { seg, t0s, sideEnd: t, tMax: t + RUNOUT_T };
}

export class DeckEngine {
  private tr: Track[];
  private els: Els;
  private emitUi: (u: Ui) => void;
  private seg: Seg[]; private t0s: number[]; private sideEnd: number; private tMax: number;

  // physics / transport
  private motor = false; private rpm: 33 | 45 = 33; private pitch = 0; private pitchGlide = false;
  private vel = 0; private angle = 0;
  private phi = PHI_REST; private lift = 0.85; private needle = false; private armDrag = false; private auto: Auto | null = null;
  private grab = false; private grabLast = 0; private grabAng = 0; private grabVel = 0; private grabAt = 0; private ratio = 0.6; private cx = 0; private cy = 0; private uPx = 60;
  private t = -LEAD; private sel = 3; private started = false; private userPaused = false;
  // beats
  private beatIdx = 0; private beatNo = 0; private pulse = 0;
  // audio
  private ctx: AudioContext | null = null; private node: AudioWorkletNode | null = null; private lp: BiquadFilterNode | null = null; private tg: GainNode | null = null;
  private workletP: Promise<void> | null = null; private audio: Ui["audio"] = "idle";
  private bytes: Record<number, Promise<ArrayBuffer>> = {};
  private loaded = -1; private loadingId = -1; private seq = 0; private rep: { pos: number; at: number } | null = null;
  private sentRate = 0; private sentNeedle = false;
  // loop
  private raf = 0; private last = 0; private visible = false; private reveal = 0; private scrollRaf = 0; private lastWaveKey = "";
  private io: IntersectionObserver; private ro: ResizeObserver;
  private reduce: boolean;
  private offs: Array<() => void> = [];
  private dpr = 1; private waveW = 0; private waveH = 0;
  private lastUi = "";

  constructor(tracks: Track[], els: Els, emit: (u: Ui) => void) {
    this.tr = tracks; this.sel = Math.min(3, tracks.length - 1); this.els = els; this.emitUi = emit;
    const L = layout(tracks); this.seg = L.seg; this.t0s = L.t0s; this.sideEnd = L.sideEnd; this.tMax = L.tMax;
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.reveal = this.reduce ? 1 : 0;
    this.io = new IntersectionObserver(([e]) => this.setVisible(e.isIntersecting), { rootMargin: "80px" });
    this.io.observe(els.root);
    this.ro = new ResizeObserver(() => { this.lastWaveKey = ""; this.measure(); this.draw(true); });
    this.ro.observe(els.wave); this.ro.observe(els.platter);

    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, ev: K, fn: (e: HTMLElementEventMap[K]) => void) => { el.addEventListener(ev, fn as EventListener); this.offs.push(() => el.removeEventListener(ev, fn as EventListener)); };
    on(els.platter, "pointerdown", (e) => this.platterDown(e));
    on(els.platter, "pointermove", (e) => this.platterMove(e));
    on(els.platter, "pointerup", (e) => this.platterUp(e));
    on(els.platter, "pointercancel", (e) => this.platterUp(e));
    on(els.head, "pointerdown", (e) => this.armDown(e));
    on(els.head, "pointermove", (e) => this.armMove(e));
    on(els.head, "pointerup", (e) => this.armUp(e));
    on(els.head, "pointercancel", (e) => this.armUp(e));
    const sc = () => { if (!this.scrollRaf) this.scrollRaf = requestAnimationFrame(() => { this.scrollRaf = 0; this.onScroll(); }); };
    window.addEventListener("scroll", sc, { passive: true }); this.offs.push(() => window.removeEventListener("scroll", sc));
    this.measure(); this.onScroll(); this.draw(true); this.paint(); this.emit();
  }

  destroy() {
    cancelAnimationFrame(this.raf); cancelAnimationFrame(this.scrollRaf);
    this.io.disconnect(); this.ro.disconnect(); this.offs.forEach((f) => f());
    try { this.node?.disconnect(); void this.ctx?.close(); } catch { /* already closed */ }
  }

  // ---------- geometry helpers ----------
  private tToR(t: number) { t = clamp(t, -LEAD, this.tMax); for (const s of this.seg) if (t <= s.t1) return lerp(s.r0, s.r1, (t - s.t0) / (s.t1 - s.t0)); return R_RUN; }
  private rToT(r: number) { r = clamp(r, R_RUN, R_LEAD); for (const s of this.seg) if (r >= s.r1) return lerp(s.t0, s.t1, (s.r0 - r) / (s.r0 - s.r1)); return this.tMax; }
  private trackAt(t: number) { for (const s of this.seg) if (t < s.t1) return s.k === "track" ? (s.i as number) : -1; return -1; }
  private measure() {
    const r = this.els.platter.getBoundingClientRect();
    if (!r.width) return;
    this.cx = r.left + r.width / 2; this.cy = r.top + r.height / 2; this.ratio = clamp(r.height / r.width, 0.3, 1);
    this.uPx = r.width / (2 * R_REC) / 1.1;   // the platter is 1.1x the record
  }
  private toPlane(e: PointerEvent) {
    this.measure();
    return { x: (e.clientX - this.cx) / this.uPx, z: (e.clientY - this.cy) / this.ratio / this.uPx };
  }

  // ---------- visibility and scroll ----------
  private setVisible(v: boolean) {
    this.visible = v;
    if (v) { this.last = performance.now(); this.measure(); if (!this.raf) this.raf = requestAnimationFrame((n) => this.frame(n)); }
    else {
      cancelAnimationFrame(this.raf); this.raf = 0;
      if (this.needle) { this.needle = false; this.userPaused = true; this.sendNeedle(); }   // leaving the deck stops the sound
      this.grab = false; this.emit();
    }
  }
  private onScroll() {
    if (this.reduce || this.started) { this.reveal = 1; return; }
    const r = this.els.root.getBoundingClientRect(), vh = window.innerHeight;
    const v = clamp((vh * 0.9 - r.top) / (vh * 0.55));
    if (v !== this.reveal) { this.reveal = v; this.lastWaveKey = ""; if (!this.raf) this.draw(true); }
  }

  // ---------- audio ----------
  private ensureAudio() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) { this.audio = "unsupported"; this.emit(); return null; }
      this.ctx = new AC({ latencyHint: "interactive" });
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }
  private ensureWorklet(): Promise<void> {
    if (this.workletP) return this.workletP;
    const ctx = this.ensureAudio();
    if (!ctx || !ctx.audioWorklet) { this.audio = "unsupported"; this.emit(); this.workletP = Promise.reject(new Error("unsupported")); this.workletP.catch(() => {}); return this.workletP; }
    this.workletP = ctx.audioWorklet.addModule("/music/deck-worklet.js").then(() => {
      const n = new AudioWorkletNode(ctx, "deck", { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 20000; lp.Q.value = 0.5;
      const tg = ctx.createGain(); tg.gain.value = 1;
      const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -2; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
      n.connect(lp); lp.connect(tg); tg.connect(lim); lim.connect(ctx.destination);
      n.port.onmessage = (e) => { const m = e.data; if (m.id === this.loaded && m.seq === this.seq) this.rep = { pos: m.pos, at: performance.now() / 1000 }; };
      this.node = n; this.lp = lp; this.tg = tg; this.audio = "ok"; this.emit();
    });
    this.workletP.catch(() => { this.audio = "unsupported"; this.emit(); });
    return this.workletP;
  }
  private fetchBytes(i: number) {
    if (!this.bytes[i]) this.bytes[i] = fetch(`/music/${this.tr[i].slug}.mp3`).then((r) => { if (!r.ok) throw new Error("fetch " + r.status); return r.arrayBuffer(); });
    return this.bytes[i];
  }
  private async loadTrack(i: number) {
    if (this.loadingId === i || this.loaded === i) return;
    this.loadingId = i; this.audio = this.audio === "ok" ? "ok" : "loading"; this.emit();
    try {
      await this.ensureWorklet();
      const bytes = await this.fetchBytes(i);
      const ctx = this.ctx as AudioContext;
      const buf = await new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(bytes.slice(0), res, rej));
      if (this.loadingId !== i) return;
      const L = new Float32Array(buf.length), R = new Float32Array(buf.length);
      buf.copyFromChannel(L, 0); buf.copyFromChannel(R, buf.numberOfChannels > 1 ? 1 : 0);
      this.seq++;
      (this.node as AudioWorkletNode).port.postMessage({ t: "load", id: i, L, R, sr: buf.sampleRate, gain: this.tr[i].gain, at: Math.max(0, this.t - this.t0s[i]), seq: this.seq }, [L.buffer, R.buffer]);
      this.loaded = i; this.loadingId = -1; this.rep = null; this.sentRate = NaN; this.sentNeedle = !this.needle; this.syncBeats();
      this.emit();
    } catch { if (this.loadingId === i) this.loadingId = -1; this.audio = "unsupported"; this.emit(); }
  }
  private seekWorklet() {
    if (!this.node || this.loaded < 0) return;
    this.seq++; this.rep = null;
    this.node.port.postMessage({ t: "seek", at: Math.max(0, this.t - this.t0s[this.loaded]), seq: this.seq });
  }
  private sendNeedle() {
    if (!this.node || this.sentNeedle === this.needle) return;
    this.sentNeedle = this.needle; this.node.port.postMessage({ t: "needle", v: this.needle });
  }
  private sendRate(rate: number) {
    if (!this.node || Math.abs(rate - this.sentRate) < 0.003) return;
    this.sentRate = rate; this.node.port.postMessage({ t: "rate", v: rate });
    // the faster the record moves, the duller and quieter it gets (backspins, fast scratches)
    const a = Math.abs(rate), now = this.ctx?.currentTime ?? 0;
    this.lp?.frequency.setTargetAtTime(a < 1.6 ? 20000 : clamp(20000 - (a - 1.6) * 4200, 4200, 20000), now, 0.03);
    this.tg?.gain.setTargetAtTime(a < 2.5 ? 1 : clamp(1 - (a - 2.5) * 0.14, 0.45, 1), now, 0.03);
  }

  // ---------- actions ----------
  private syncBeats() {
    const tr = this.tr[this.loaded >= 0 ? this.loaded : this.sel]; if (!tr) return;
    const local = this.t - this.t0s[this.loaded >= 0 ? this.loaded : this.sel];
    let lo = 0, hi = tr.beats.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (tr.beats[m] < local) lo = m + 1; else hi = m; }
    this.beatIdx = lo;
  }
  private dropAt(t: number) {
    this.ensureWorklet().catch(() => {});
    this.t = clamp(t, -LEAD, this.tMax); this.needle = true; this.started = true; this.userPaused = false; this.auto = null; this.reveal = 1;
    if (!this.motor) this.motor = true;
    const ti = this.trackAt(this.t); if (ti >= 0) { this.sel = ti; void this.loadTrack(ti); }
    this.seekWorklet(); this.syncBeats(); this.sendNeedle(); this.emit();
  }
  private liftNeedle() { if (this.needle) { this.needle = false; this.sendNeedle(); } }
  private cueTo(t: number, fast: boolean) { this.liftNeedle(); this.auto = { phi: phiForR(this.tToR(t)), t, drop: true, fast }; this.started = true; this.reveal = 1; this.emit(); this.kick(); }
  private kick() { if (this.visible && !this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame((n) => this.frame(n)); } }

  toggleMotor() { this.ensureWorklet().catch(() => {}); this.motor = !this.motor; this.started = true; this.reveal = 1; this.emit(); this.kick(); }
  toggleRpm() { this.rpm = this.rpm === 33 ? 45 : 33; this.emit(); }
  setPitch(v: number) { this.pitchGlide = false; let p = clamp(Math.round(v * 10) / 10, -8, 8); if (Math.abs(p) < 0.25) p = 0; this.pitch = p; this.emit(); }
  zeroPitch() { if (this.pitch !== 0) { this.pitchGlide = true; this.kick(); } }
  playIndex() {
    const ti = this.trackAt(this.t);
    return (this.needle || this.auto?.drop) ? (this.auto?.drop ? this.trackAt(this.auto.t) : ti) : -1;
  }
  toggleTrack(i: number) {
    this.ensureWorklet().catch(() => {});
    this.sel = i;
    const here = this.loaded === i && this.trackAt(this.t) === i;
    if (here && (this.needle || this.auto?.drop)) { this.auto = null; this.liftNeedle(); this.userPaused = true; this.emit(); return; }
    if (here && this.started && !this.needle) { this.userPaused = false; this.cueTo(this.t, true); return; }
    this.userPaused = false; void this.loadTrack(i); this.cueTo(this.t0s[i], false);
  }
  cueFrac(f: number) {
    this.ensureWorklet().catch(() => {});
    void this.loadTrack(this.sel);
    this.cueTo(this.t0s[this.sel] + clamp(f) * this.tr[this.sel].dur, true);
  }
  /** Sound can only start from a touch; this primes audio on the first press of anything on the deck. */
  prime() { this.ensureAudio(); }

  // ---------- pointer: platter (scratch) ----------
  private platterDown(e: PointerEvent) {
    this.prime(); this.ensureWorklet().catch(() => {});
    if (e.button > 0) return;
    this.measure();
    const p = this.toPlane(e);
    if (Math.hypot(p.x, p.z) > R_REC * 1.1) return;
    this.grab = true; this.grabAng = Math.atan2(p.z, p.x); this.grabAt = performance.now(); this.grabVel = 0; this.grabLast = this.grabAt;
    this.started = true; this.reveal = 1;
    try { this.els.platter.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    this.emit(); this.kick();
  }
  private platterMove(e: PointerEvent) {
    if (!this.grab) return;
    const p = this.toPlane(e), a = Math.atan2(p.z, p.x), now = performance.now();
    let da = a - this.grabAng; if (da > Math.PI) da -= Math.PI * 2; else if (da < -Math.PI) da += Math.PI * 2;
    const rev = da / (Math.PI * 2), dt = Math.max(0.004, (now - this.grabAt) / 1000);
    this.angle += rev * 360; this.grabAng = a;
    this.grabVel = this.grabVel * 0.45 + (rev / dt) * 0.55;
    this.grabVel = clamp(this.grabVel, -6, 6);
    this.grabAt = now; this.grabLast = now;
    e.preventDefault();
  }
  private platterUp(e: PointerEvent) {
    if (!this.grab) return;
    this.grab = false; this.vel = this.grabVel;
    try { this.els.platter.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    this.emit();
  }

  // ---------- pointer: tonearm ----------
  private armDown(e: PointerEvent) {
    this.prime(); this.ensureWorklet().catch(() => {});
    this.armDrag = true; this.auto = null; this.liftNeedle(); this.started = true; this.reveal = 1;
    try { this.els.head.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    e.preventDefault(); this.emit(); this.kick();
  }
  private armMove(e: PointerEvent) {
    if (!this.armDrag) return;
    const p = this.toPlane(e);
    this.phi = clamp(Math.atan2(p.z - PV.z, p.x - PV.x), PHI_REST, PHI_MAX);
    e.preventDefault();
  }
  private armUp(e: PointerEvent) {
    if (!this.armDrag) return;
    this.armDrag = false;
    try { this.els.head.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    const r = rAt(this.phi);
    if (r < R_REC - 0.04 && r > R_RUN - 0.02) this.dropAt(this.rToT(r));
    else this.auto = { phi: PHI_REST, t: 0, drop: false, fast: false };
    this.emit(); this.kick();
  }

  // ---------- frame ----------
  private frame(now: number) {
    this.raf = 0;
    if (!this.visible) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000)); this.last = now;

    // pitch glides home when zeroed
    if (this.pitchGlide) { this.pitch += (0 - this.pitch) * (1 - Math.exp(-dt / 0.12)); if (Math.abs(this.pitch) < 0.05) { this.pitch = 0; this.pitchGlide = false; } this.emit(); }

    // platter: motor with spin-up, friction power-down, or a hand holding it
    const target = this.motor ? (this.rpm / 60) * (1 + this.pitch / 100) : 0;
    if (this.grab) {
      if (now - this.grabLast > 55) this.grabVel *= Math.exp(-dt * 28);   // a held record stops
      this.vel = this.grabVel;
    } else if (this.motor) this.vel += (target - this.vel) * (1 - Math.exp(-dt / 0.42));
    else { this.vel *= Math.exp(-dt / 1.05); if (Math.abs(this.vel) < 0.004) this.vel = 0; }
    if (!this.grab) this.angle += this.vel * 360 * dt;
    const rate = this.vel / NOM;

    // needle position in time
    if (this.needle) {
      this.t += rate * dt;
      const ti = this.trackAt(this.t);
      if (ti >= 0 && ti !== this.loaded && ti !== this.loadingId) { this.sel = ti; void this.loadTrack(ti); }
      else if (ti >= 0 && ti === this.loaded && this.rep && !this.grab && Math.abs(rate) > 0.5) {
        const age = now / 1000 - this.rep.at, wt = this.t0s[ti] + this.rep.pos + age * rate;
        if (Math.abs(wt - this.t) > 0.04 && Math.abs(wt - this.t) < 1) this.t += (wt - this.t) * 0.15;
      }
      if (this.t <= -LEAD) { this.t = -LEAD; }
      if (this.t >= this.tMax) { this.t = this.tMax; this.liftNeedle(); this.auto = { phi: PHI_REST, t: 0, drop: false, fast: false }; this.emit(); }
      this.phi = phiForR(this.tToR(this.t));
    }
    this.sendRate(this.needle ? rate : 0);

    // tonearm travel (auto cue / return)
    if (this.auto && !this.armDrag) {
      const sp = (this.auto.fast ? 4.2 : 1.9) * dt, d = this.auto.phi - this.phi;
      if (Math.abs(d) <= sp) {
        this.phi = this.auto.phi;
        const a = this.auto; this.auto = null;
        if (a.drop) this.dropAt(a.t);
      } else this.phi += Math.sign(d) * sp;
    }
    const liftTarget = this.needle && !this.armDrag && !this.auto ? 0 : 0.85;
    this.lift += (liftTarget - this.lift) * (1 - Math.exp(-dt / 0.07));

    // beat clock
    let beatNow = false;
    if (this.loaded >= 0 && this.needle && this.trackAt(this.t) === this.loaded) {
      const tr = this.tr[this.loaded], local = this.t - this.t0s[this.loaded];
      let lo = 0, hi = tr.beats.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (tr.beats[m] <= local) lo = m + 1; else hi = m; }
      if (lo > this.beatIdx && lo - this.beatIdx <= 2 && rate > 0.2) { beatNow = true; this.beatNo++; }
      this.beatIdx = lo;
    }
    if (beatNow) this.pulse = 1; else this.pulse *= Math.exp(-dt * 6.5);
    if (this.pulse < 0.01) this.pulse = 0;

    this.paint(); this.draw(false);
    this.emit();
    if (this.visible) this.raf = requestAnimationFrame((n) => this.frame(n));
  }

  private paint() {
    const { disc, arm, plane, time, beat } = this.els;
    disc.style.transform = `rotate(${this.angle.toFixed(2)}deg)`;
    arm.style.transform = `translateZ(${(this.lift * 20).toFixed(1)}px) rotate(${this.phi.toFixed(4)}rad)`;
    arm.style.setProperty("--lift", this.lift.toFixed(3));
    plane.style.setProperty("--pulse", this.pulse.toFixed(3));
    const ti = this.trackAt(this.t), tr = ti >= 0 ? this.tr[ti] : this.tr[this.sel];
    const local = ti >= 0 ? this.t - this.t0s[ti] : 0;
    const txt = `${fmt(local)} / ${fmt(tr.dur)}`;
    if (time.textContent !== txt) time.textContent = txt;
    const bt = this.needle && ti >= 0 ? `Beat ${this.beatNo ? this.beatIdx : 0} of ${tr.beats.length}` : `${tr.beats.length} beats found`;
    if (beat.textContent !== bt) beat.textContent = bt;
  }

  // ---------- waveform with the beats the site found ----------
  private draw(force: boolean) {
    const cv = this.els.wave, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    const ti = this.trackAt(this.t), here = ti === this.sel;
    const local = here ? clamp((this.t - this.t0s[this.sel]) / this.tr[this.sel].dur) : 0;
    const key = `${this.sel}|${local.toFixed(4)}|${this.beatIdx}|${this.pulse > 0 ? this.pulse.toFixed(2) : 0}|${this.reveal.toFixed(2)}|${w}`;
    if (!force && key === this.lastWaveKey) return;
    this.lastWaveKey = key;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    this.dpr = dpr; this.waveW = cv.width; this.waveH = cv.height;
    const g = cv.getContext("2d"); if (!g) return;
    const tr = this.tr[this.sel], pk = tr.peaks, n = pk.length, W = cv.width, H = cv.height, bw = W / n;
    g.clearRect(0, 0, W, H);
    const top = Math.round(14 * dpr);   // strip for beat ticks above the bars
    const bars = H - top;
    // bars: the waveform draws in left to right as the section scrolls into view
    for (let i = 0; i < n; i++) {
      const f = i / n; if (f > Math.min(1, this.reveal * 1.25)) break;
      const bh = Math.max(dpr, pk[i] * bars * 0.94), played = here && f < local;
      g.fillStyle = played ? "#7B90FF" : "rgba(242,240,234,.32)";
      g.fillRect(i * bw, top + (bars - bh) / 2, Math.max(1, bw - dpr * 0.7), bh);
    }
    // beat ticks snap on behind the reveal
    const bs = tr.beats, shown = Math.floor(bs.length * clamp((this.reveal - 0.25) / 0.7));
    for (let k = 0; k < shown; k++) {
      const x = (bs[k] / tr.dur) * W, passed = here && bs[k] / tr.dur < local;
      const last = here && this.needle && k === this.beatIdx - 1;
      g.fillStyle = last ? `rgba(255,255,255,${0.55 + 0.45 * this.pulse})` : passed ? "#7B90FF" : "rgba(242,240,234,.55)";
      const th = last ? Math.round((8 + 5 * this.pulse) * dpr) : Math.round(6 * dpr);
      g.fillRect(x - dpr * 0.5, 0, Math.max(1, dpr), th);
    }
    if (here && this.started) { g.fillStyle = "#F2F0EA"; g.fillRect(local * W - dpr, top, dpr * 2, bars); }
  }

  // ---------- state for the React side ----------
  private stateLabel() {
    if (this.audio === "unsupported") return "Sound isn’t available here";
    if (this.grab) return "Scratching";
    if (this.loadingId >= 0 && this.needle) return "Loading the track";
    if (this.needle && this.trackAt(this.t) < 0) return "Between tracks";
    if (this.needle && Math.abs(this.vel) > 0.05) return "Playing";
    if (this.needle) return "Needle down";
    if (this.motor) return this.auto ? "Cueing" : "Spinning";
    return "Stopped";
  }
  private emit() {
    const tr = this.tr[this.sel];
    const u: Ui = {
      motor: this.motor, rpm: this.rpm, pitch: Math.round(this.pitch * 10) / 10, sel: this.sel, playing: this.playIndex(),
      state: this.stateLabel(), title: tr.title, meta: `${tr.bpm} BPM · ${tr.beats.length} beats in this excerpt`, ready: true, audio: this.audio,
    };
    const k = JSON.stringify(u);
    if (k !== this.lastUi) { this.lastUi = k; this.emitUi(u); }
  }
}
