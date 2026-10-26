/* eslint-disable */
// @ts-nocheck
/**
 * The Reytek deck, ported from reytek1201.com (assets/main.js, the music deck) with as few changes as possible:
 * same three.js scene, same physics, same AudioWorklet, same panel. Shims stand in for the parts of his site
 * that live outside the deck (theme, sound switch, the background vortex). three.js loads only when this mounts.
 */
const MARKUP = '<div class="deck-wrap">\n<div class="deck-stage" id="deckStage">\n<canvas id="deckGL" role="img" aria-label="Turntable. Use the controls beside it to play tracks."></canvas>\n<div class="deck-hint" id="deckHint" aria-hidden="true"><span class="l">Drag me onto the record</span><span class="s">Drag or tap a groove</span></div>\n<div class="deck-tip" id="deckTip" hidden></div>\n</div>\n<aside class="deck-panel" aria-label="Deck controls">\n<div class="readout">\n<div class="ro-top"><span id="roState" aria-live="polite">Standby</span><span id="roTime">0:00 / 0:00</span></div>\n<div class="ro-main"><img id="roCover" alt="" width="64" height="64"><div><b id="roTitle">—</b><i id="roMeta"></i></div></div>\n<canvas id="roWave" aria-label="Track waveform. Click to cue a point in the track." role="img"></canvas>\n<div class="ro-stats"><span>Pitch<b id="roPitch">0.0%</b></span><span>RPM<b id="roRpm">33⅓</b></span><span>BPM<b id="roBpm">—</b></span><span>Beat<b id="roBeat">·</b></span></div>\n</div>\n<ol class="crate" id="crate" aria-label="Tracks"></ol>\n<div class="deck-ctl">\n<button class="hw" id="btnStart" type="button" aria-pressed="false">Start</button>\n<button class="hw" id="btnRpm" type="button" aria-pressed="false">33 rpm</button>\n<div class="pitch">\n<div class="pitch-head"><label for="pitch">Pitch ±8%</label><button class="pitch-zero" id="pitchZero" type="button" disabled><span aria-hidden="true">↺ </span>0%<span class="sr-only"> pitch reset</span></button></div>\n<input id="pitch" type="range" min="-8" max="8" step="0.1" value="0" title="Double-click to reset to 0">\n</div>\n</div>\n<a class="sc-link" href="https://soundcloud.com/reytek1201" target="_blank" rel="noopener">Full catalogue on SoundCloud ↗</a>\n</aside>\n</div>';

export async function mountDeck(host, data) {
  const THREE = await import("three");
  const CLEAN = [];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PLEX = getComputedStyle(document.documentElement).getPropertyValue('--font-plex').trim() || '"IBM Plex Mono"';
  const SIG = [34, 211, 238];
  const THEME = { rgb: SIG.join(','), hex: '#22d3ee', c: SIG.map(v => v / 255), tint: k => SIG.map(v => Math.round(v + (255 - v) * k)).join(','), on: () => {}, onSettle: () => {} };
  const A = { ctx: null, on: false };
  function startAudio() {
    if (A.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx; try { ctx = new AC({ latencyHint: 'playback' }); } catch (e) { ctx = new AC(); }
    A.ctx = ctx;
    const deckOut = A.deckOut = ctx.createGain(); deckOut.gain.value = 0; deckOut.connect(ctx.destination);
    const nb = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; A.noise = nb;
  }
  function env(g, t, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function setSound(on) {
    A.on = on;
    if (on) { startAudio(); A.ctx.resume(); A.deckOut.gain.cancelScheduledValues(A.ctx.currentTime); A.deckOut.gain.setTargetAtTime(1, A.ctx.currentTime, 0.05); }
  }
  const shock = () => {};
  let justBeat = false, clock = 0, beat = 0;

  host.innerHTML = MARKUP;
  const $ = s => host.querySelector(s);
  const TRACKS = data.map(t => ({ title: t.title, file: `/music/${t.slug}.mp3`, cover: `/music/${t.cover}`, label: t.label ? `/music/${t.label}` : null, bpm: t.bpm, dur: t.dur, gain: t.gain, beats: t.beats, peaks: t.peaks }));

// ======================= from reytek1201.com assets/main.js =======================
  const WORKLET_URL = '/music/deck-worklet.js';
  const NOM = 100 / 3 / 60;                 // 33 1/3 rpm in revolutions per second
  const LEAD = 2.5, GAPT = 3, RUNOUT_T = 4; // seconds of lead-in, gap between tracks, run-out
  const R_LEAD = 1.465, R_OUT = 1.42, R_IN = 0.66, R_RUN = 0.56, GAP_W = 0.045, R_REC = 1.5;
  const PV = { x: 2.3, z: -1.2 }, ARM_L = 2.45, ARM_Y = 0.42, PHI_REST = 97 * Math.PI / 180;
  const D = {
    built: false, node: null, out: null, loaded: -1, loadingId: -1, bytes: {}, seq: 0, rep: null,
    motor: false, rpm: 33, vel: 0, angle: 0, pitch: 0,
    phi: PHI_REST, lift: 0.85, needle: false, audible: false, armDrag: false, auto: null,
    grab: false, grabA: 0, grabT: 0, grabVel: 0, down: null,
    t: -LEAD, sel: 0, beatIdx: 0, beatNo: 0, lastLocal: -99, hold: false, visible: false, near: false, engage: 0, engageUntil: 0,
    backspin: 0, pending: null, started: false, lastRate: 0, lockRev: 0, hover: false, pitchDrag: false, sentNeedle: false
  };

  // ---- side layout: lead-in, track bands (width by duration), gaps, run-out ----
  const SEG = [];
  (() => {
    SEG.push({ k: 'lead', t0: -LEAD, t1: 0, r0: R_LEAD, r1: R_OUT });
    const total = TRACKS.reduce((s, x) => s + x.dur, 0), span = (R_OUT - R_IN) - GAP_W * (TRACKS.length - 1);
    let t = 0, r = R_OUT;
    TRACKS.forEach((tr, i) => {
      const w = span * tr.dur / total;
      tr.start = t; tr.r0 = r; tr.r1 = r - w;
      SEG.push({ k: 'track', i, t0: t, t1: t + tr.dur, r0: r, r1: r - w });
      t += tr.dur; r -= w;
      if (i < TRACKS.length - 1) { SEG.push({ k: 'gap', t0: t, t1: t + GAPT, r0: r, r1: r - GAP_W }); t += GAPT; r -= GAP_W; }
    });
    SEG.push({ k: 'run', t0: t, t1: t + RUNOUT_T, r0: r, r1: R_RUN });
    D.sideEnd = t; D.tMax = t + RUNOUT_T;
  })();
  function tToR(t) { t = clamp(t, -LEAD, D.tMax); for (const s of SEG) if (t <= s.t1) return lerp(s.r0, s.r1, (t - s.t0) / (s.t1 - s.t0)); return R_RUN; }
  function rToT(r) { r = clamp(r, R_RUN, R_LEAD); for (const s of SEG) if (r >= s.r1) return lerp(s.t0, s.t1, (s.r0 - r) / (s.r0 - s.r1)); return D.tMax; }
  function segAt(t) { for (const s of SEG) if (t < s.t1) return s; return SEG[SEG.length - 1]; }
  function trackAt(t) { const s = segAt(t); return s.k === 'track' ? s.i : -1; }

  // ---- tonearm geometry: stylus position for an arm angle, and the inverse ----
  const stylusAt = phi => ({ x: PV.x + ARM_L * Math.cos(phi), z: PV.z + ARM_L * Math.sin(phi) });
  const rAt = phi => { const s = stylusAt(phi); return Math.hypot(s.x, s.z); };
  const PHI_MAX = (() => { let lo = PHI_REST, hi = PHI_REST + 1.2; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (rAt(m) > 0.5) lo = m; else hi = m; } return lo; })();
  function phiForR(r) { let lo = PHI_REST, hi = PHI_MAX; for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (rAt(m) > r) lo = m; else hi = m; } return (lo + hi) / 2; }
  const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  const dk = {
    stage: $('#deckStage'), canvas: $('#deckGL'), hint: $('#deckHint'), tip: $('#deckTip'),
    state: $('#roState'), time: $('#roTime'), title: $('#roTitle'), meta: $('#roMeta'), cover: $('#roCover'),
    wave: $('#roWave'), pitchOut: $('#roPitch'), rpmOut: $('#roRpm'), bpmOut: $('#roBpm'), beatOut: $('#roBeat'),
    start: $('#btnStart'), rpmBtn: $('#btnRpm'), pitch: $('#pitch'), crate: $('#crate'), section: host
  };

  // ---- audio: worklet voice + needle sounds ----
  let workletP = null;
  function ensureWorklet() {
    if (!A.ctx) startAudio();
    if (workletP) return workletP;
    if (!A.ctx.audioWorklet) { workletP = Promise.reject(new Error('AudioWorklet unsupported')); workletP.catch(() => {}); return workletP; }
    workletP = A.ctx.audioWorklet.addModule(WORKLET_URL).then(() => {
      const n = new AudioWorkletNode(A.ctx, 'deck', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2] });
      // speed taming: the faster the record moves (backspins, fast scratches), the duller and quieter it gets
      const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 20000; lp.Q.value = 0.5;
      const tg = A.ctx.createGain(); tg.gain.value = 1;
      // a safety limiter so nothing on the deck can ever clip
      const lim = A.ctx.createDynamicsCompressor(); lim.threshold.value = -2; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
      n.connect(lp); lp.connect(tg); tg.connect(lim); lim.connect(A.deckOut); D.fxLp = lp; D.fxGain = tg;
      n.port.onmessage = e => { const m = e.data; if (m.id === D.loaded && m.seq === D.seq) D.rep = { pos: m.pos, at: performance.now() / 1000 }; };
      D.node = n;
    });
    workletP.catch(() => { dk.state.textContent = 'Audio unsupported'; });
    return workletP;
  }
  function fetchBytes(i) {
    if (!D.bytes[i]) D.bytes[i] = fetch(TRACKS[i].file).then(r => { if (!r.ok) throw new Error('fetch ' + r.status); return r.arrayBuffer(); });
    return D.bytes[i];
  }
  async function loadTrack(i) {
    if (D.loadingId === i || D.loaded === i) return;
    D.loadingId = i;
    try {
      await ensureWorklet();
      const bytes = await fetchBytes(i);
      const buf = await new Promise((res, rej) => A.ctx.decodeAudioData(bytes.slice(0), res, rej));
      if (D.loadingId !== i) return;
      const L = new Float32Array(buf.length), R = new Float32Array(buf.length);
      buf.copyFromChannel(L, 0); buf.copyFromChannel(R, buf.numberOfChannels > 1 ? 1 : 0);
      D.seq++;
      D.node.port.postMessage({ t: 'load', id: i, L, R, sr: buf.sampleRate, gain: TRACKS[i].gain, at: D.t - TRACKS[i].start, seq: D.seq }, [L.buffer, R.buffer]);
      D.loaded = i; D.loadingId = -1; D.rep = null; resetBeats();
    } catch (err) { if (D.loadingId === i) D.loadingId = -1; dk.state.textContent = 'Load error'; console.warn(err); }
  }
  function seekWorklet() {
    if (!D.node || D.loaded < 0) return;
    D.seq++; D.rep = null;
    D.node.port.postMessage({ t: 'seek', at: D.t - TRACKS[D.loaded].start, seq: D.seq });
  }
  function needleSound(down) {
    if (!A.ctx || !A.on || down) return;   // no sound when the needle lands; only a faint tick on lift
    const c = A.ctx, t = c.currentTime;
    const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    n.buffer = A.noise; f.type = 'bandpass'; f.frequency.value = down ? 1400 : 2600; f.Q.value = 0.8;
    env(g, t, down ? 0.035 : 0.018, down ? 0.06 : 0.025); n.connect(f); f.connect(g); g.connect(A.deckOut); n.start(t); n.stop(t + 0.1);
    if (down) { const o = c.createOscillator(), og = c.createGain(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.08); env(og, t, 0.09, 0.1); o.connect(og); og.connect(A.deckOut); o.start(t); o.stop(t + 0.14); }
  }
  function resetBeats() {
    const tr = TRACKS[D.loaded]; if (!tr) return;
    const local = D.t - tr.start; let lo = 0, hi = tr.beats.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (tr.beats[m] < local) lo = m + 1; else hi = m; }
    D.beatIdx = lo; D.lastLocal = local;
  }

  // ---- actions ----
  function setMotor(on) {
    D.motor = on; dk.start.setAttribute('aria-pressed', on ? 'true' : 'false');
    dk.start.textContent = on ? 'Stop' : 'Start';
    if (D.btnPress) D.btnPress = 1;
  }
  function setRpm(r) { D.rpm = r; dk.rpmBtn.textContent = r === 33 ? '33 rpm' : '45 rpm'; dk.rpmBtn.setAttribute('aria-pressed', r === 45 ? 'true' : 'false'); }
  function setPitch(v, raw) {
    D.pitch = clamp(raw ? v : Math.round(v * 10) / 10, -8, 8);
    if (!raw && Math.abs(D.pitch) < 0.25) D.pitch = 0;
    dk.pitch.value = D.pitch;
    const z = $('#pitchZero'); if (z) z.disabled = D.pitch === 0 && !D.pitchGlide;
  }
  function zeroPitch() { if (D.pitch !== 0) D.pitchGlide = true; }
  const track = (name, params) => { try { if (window.gtag) window.gtag('event', name, params); } catch (e) {} };
  function dropAt(t) {
    if (window.RTPlayer && window.RTPlayer.playing()) window.RTPlayer.pause();
    setSound(true);
    ensureWorklet().catch(() => {});
    D.t = clamp(t, -LEAD, D.tMax); D.needle = true; D.started = true; D.auto = null;
    if (!D.motor) setMotor(true);
    const ti = trackAt(D.t); if (ti >= 0) { if (D.lastPlayed !== ti) { D.lastPlayed = ti; track('play_track', { track_title: TRACKS[ti].title }); } D.sel = ti; loadTrack(ti); }
    if (D.loaded >= 0) seekWorklet();
    resetBeats();
  }
  function liftNeedle() { if (D.needle) { D.needle = false; } }
  function cueTo(t, fast) { liftNeedle(); D.auto = { phi: phiForR(tToR(t)), t, drop: true, fast: !!fast }; }
  function playTrack(i) {
    D.sel = i; updateCrate();
    if (D.audible && D.vel > NOM * 0.5 && !reduce) {
      D.backspin = 0.45; D.vel = -NOM * 2.4; D.pending = i; shock(0, 0, true);
      return;
    }
    setSound(true); ensureWorklet().catch(() => {}); loadTrack(i);
    cueTo(TRACKS[i].start, false);
  }
  function finishBackspin() {
    const i = D.pending; D.pending = null; if (i == null) return;
    liftNeedle(); D.lift = 0.5;
    D.auto = { phi: phiForR(tToR(TRACKS[i].start)), t: TRACKS[i].start, drop: true, fast: true };
  }

  // ---- panel ----
  TRACKS.forEach((t, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button"><img src="${t.cover}" alt="" width="44" height="44"><span class="tx"><span class="t"><span class="sr-only sr-act">Play </span>${t.title}</span><span class="m">${Math.round(t.bpm)} BPM · ${fmt(t.dur)}</span></span><span class="n">${t.isNew ? '<span class="new">New</span>' : ''}A${i + 1}</span><span class="pl" aria-hidden="true"><svg class="py" viewBox="0 0 12 12"><path d="M3 1.5v9l7.5-4.5z"/></svg><svg class="pa" viewBox="0 0 12 12"><path d="M2.5 1.5h2.6v9H2.5zM6.9 1.5h2.6v9H6.9z"/></svg></span></button>`;
    const b = li.querySelector('button');
    b.addEventListener('click', () => toggleTrack(i));
    dk.crate.appendChild(li);
  });
  // play / pause from the track list, for anyone who'd rather not drag the arm
  function toggleTrack(i) {
    const here = D.loaded === i && trackAt(D.t) === i && D.pending == null;
    if (here && (D.needle || (D.auto && D.auto.drop))) { D.auto = null; liftNeedle(); D.userPaused = true; return; }
    if (here && D.started && !D.needle) { setSound(true); ensureWorklet().catch(() => {}); D.userPaused = false; cueTo(D.t, true); return; }
    D.userPaused = false; playTrack(i);
  }
  let playIcon = '';
  function updatePlayIcons() {
    const ti = trackAt(D.t), on = (D.needle || (D.auto && D.auto.drop)) && D.pending == null ? (D.auto && D.auto.drop ? trackAt(D.auto.t) : ti) : -1;
    const key = on + '|' + D.sel; if (key === playIcon) return; playIcon = key;
    [...dk.crate.querySelectorAll('button')].forEach((b, k) => {
      b.classList.toggle('playing', k === on);
      b.querySelector('.sr-act').textContent = k === on ? 'Pause ' : 'Play ';
    });
  }
  function updateCrate() { [...dk.crate.querySelectorAll('button')].forEach((b, i) => b.setAttribute('aria-current', i === D.sel ? 'true' : 'false')); }
  updateCrate();
  dk.start.addEventListener('click', () => { setSound(true); ensureWorklet().catch(() => {}); setMotor(!D.motor); });
  dk.rpmBtn.addEventListener('click', () => setRpm(D.rpm === 33 ? 45 : 33));
  dk.pitch.addEventListener('input', () => { D.pitchGlide = false; setPitch(parseFloat(dk.pitch.value)); });
  dk.pitch.addEventListener('dblclick', zeroPitch);
  $('#pitchZero').addEventListener('click', zeroPitch);
  dk.wave.addEventListener('click', e => {
    const r = dk.wave.getBoundingClientRect(), f = clamp((e.clientX - r.left) / r.width), tr = TRACKS[D.sel];
    setSound(true); ensureWorklet().catch(() => {}); loadTrack(D.sel);
    cueTo(tr.start + f * tr.dur, true);
  });
  let shownSel = -1;
  function showTrack(i) {
    if (i === shownSel) return; shownSel = i;
    const t = TRACKS[i];
    dk.title.textContent = t.title; dk.cover.src = t.cover; dk.meta.textContent = `Side A · track ${i + 1} · ${fmt(t.dur)}`;
    if (D.setLabel) D.setLabel(i);
    updateCrate();
  }
  function drawWave() {
    const cv = dk.wave, w = cv.clientWidth, h = cv.clientHeight; if (!w) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const g = cv.getContext('2d'), tr = TRACKS[D.sel], pk = tr.peaks, n = pk.length;
    const local = clamp((D.t - tr.start) / tr.dur), bw = cv.width / n;
    g.clearRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < n; i++) {
      const a = pk[i], bh = Math.max(1, a * cv.height * 0.92), played = i / n < local && trackAt(D.t) === D.sel;
      g.fillStyle = played ? THEME.hex : 'rgba(237,235,230,.28)';
      g.fillRect(i * bw, (cv.height - bh) / 2, Math.max(1, bw - dpr * 0.6), bh);
    }
    if (trackAt(D.t) === D.sel) { g.fillStyle = '#EDEBE6'; g.fillRect(local * cv.width - dpr, 0, dpr * 2, cv.height); }
  }

  // ---- 3D deck ----
  function deckBuild() {
    const canvas = dk.canvas;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const small = Math.min(innerWidth, innerHeight) < 700;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(22, 1.3, 0.1, 100);
    const V = (x, y, z) => new THREE.Vector3(x, y, z);


    // studio reflections painted onto a sphere (matcap): reads as real metal, same result on every GPU
    const MATCAPS = [];
    function matcap(o, c, tex) {
      c = c || document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
      g.clearRect(0, 0, 256, 256); g.save(); g.beginPath(); g.arc(128, 128, 128, 0, 7); g.clip();
      let rg = g.createRadialGradient(118, 108, 8, 128, 128, 132); rg.addColorStop(0, o.mid); rg.addColorStop(0.7, o.edge); rg.addColorStop(1, o.rim0);
      g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
      const lg = g.createLinearGradient(0, 0, 0, 256);
      lg.addColorStop(0, `rgba(255,255,255,${o.sky})`); lg.addColorStop(0.47, `rgba(255,255,255,${o.sky * 0.35})`);
      lg.addColorStop(0.5, `rgba(0,0,0,${o.floor})`); lg.addColorStop(1, `rgba(0,0,0,${o.floor * 0.6})`);
      g.fillStyle = lg; g.fillRect(0, 0, 256, 256);
      const blob = (x, y, rx, ry, rot, a, col = '255,255,255') => {
        g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, ry / rx);
        const b = g.createRadialGradient(0, 0, 0, 0, 0, rx); b.addColorStop(0, `rgba(${col},${a})`); b.addColorStop(o.hard, `rgba(${col},${a * 0.85})`); b.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = b; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore();
      };
      blob(82, 66, 56, 22, -0.55, o.key);            // softbox, upper left
      blob(176, 92, 26, 10, 0.5, o.key * 0.45);      // second strip
      blob(60, 200, 40, 9, 0.35, o.cyan, THEME.rgb);   // cyan bounce, lower left
      g.lineWidth = 7; g.strokeStyle = `rgba(${THEME.rgb},${o.cyan * 0.8})`; g.beginPath(); g.arc(128, 128, 122, -0.75, 0.55); g.stroke();
      g.restore();
      if (tex) { tex.needsUpdate = true; return tex; }
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; MATCAPS.push([o, c, t]); return t;
    }
    const mcChrome = matcap({ mid: '#6d737d', edge: '#1b1d22', rim0: '#050506', sky: 0.32, floor: 0.55, key: 1.0, hard: 0.55, cyan: 0.75 });
    const mcSatin = matcap({ mid: '#5b6069', edge: '#24272d', rim0: '#0b0c0e', sky: 0.18, floor: 0.35, key: 0.55, hard: 0.2, cyan: 0.4 });
    const mcBlack = matcap({ mid: '#24262b', edge: '#0b0c0e', rim0: '#030304', sky: 0.1, floor: 0.4, key: 0.32, hard: 0.25, cyan: 0.35 });
    const M = {
      chrome: new THREE.MeshMatcapMaterial({ matcap: mcChrome }),
      satin: new THREE.MeshMatcapMaterial({ matcap: mcSatin }),
      gloss: new THREE.MeshMatcapMaterial({ matcap: mcBlack }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: 0.35, roughness: 0.42 }),
      black: new THREE.MeshStandardMaterial({ color: 0x08090b, metalness: 0.3, roughness: 0.5 }),
      rubber: new THREE.MeshStandardMaterial({ color: 0x07080a, metalness: 0, roughness: 0.92 }),
      cyan: new THREE.MeshStandardMaterial({ color: 0x0a3540, metalness: 0.2, roughness: 0.3, emissive: 0x22d3ee, emissiveIntensity: 0.4 }),
      led: new THREE.MeshStandardMaterial({ color: 0x041014, emissive: 0x22d3ee, emissiveIntensity: 0 })
    };
    // one dramatic key from the upper left that falls off across the deck, a faint fill, a cyan rim from behind
    const LIGHT = new THREE.Vector3(-3.2, 7.5, 3.0);
    scene.add(new THREE.HemisphereLight(0x6f7a90, 0x020203, 0.14));
    const key = new THREE.SpotLight(0xfff6ea, 2.6, 22, 0.5, 0.95, 1.1);
    key.position.copy(LIGHT); key.target.position.set(0.7, 0, 0.1); scene.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(small ? 512 : 1024, small ? 512 : 1024);
    key.shadow.camera.near = 3; key.shadow.camera.far = 16; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
    const fill = new THREE.DirectionalLight(0xa8c4ff, 0.12); fill.position.set(6, 3, 6); scene.add(fill);
    const back = new THREE.DirectionalLight(0x22d3ee, 0.9); back.position.set(1.5, 0.9, -7); scene.add(back);
    const rim = new THREE.PointLight(0x22d3ee, 1.4, 6, 2); rim.position.set(-1.62, 0.6, -1.0); scene.add(rim);

    // plinth
    const X0 = -1.85, X1 = 2.95, Z0 = -1.9, Z1 = 1.9, PW = X1 - X0, PD = Z1 - Z0, PCX = (X0 + X1) / 2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(PW, 0.36, PD), M.dark); body.position.set(PCX, -0.18, 0); body.receiveShadow = true; scene.add(body);
    // soft shadow under the whole deck so it sits on something
    const floorCan = document.createElement('canvas'); floorCan.width = floorCan.height = 256;
    (() => { const g = floorCan.getContext('2d'), rg = g.createRadialGradient(128, 128, 30, 128, 128, 128); rg.addColorStop(0, 'rgba(0,0,0,.85)'); rg.addColorStop(0.6, 'rgba(0,0,0,.45)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, 256, 256); })();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(PW * 1.55, PD * 1.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(floorCan), transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(PCX + 0.35, -0.37, -0.15); scene.add(floor);

    // ---- light runner: a bright head racing the plinth edge, leaving a wall of light behind it ----
    const RX0 = X0 + 0.035, RX1 = X1 - 0.035, RZ0 = Z0 + 0.035, RZ1 = Z1 - 0.035;
    const RW = RX1 - RX0, RD = RZ1 - RZ0, PER = 2 * (RW + RD);
    const wrapS = s => ((s % PER) + PER) % PER;
    function perim(s) {           // point on the edge + inward normal, hard 90° corners
      s = wrapS(s);
      if (s < RW) return [RX0 + s, RZ1, 0, -1];
      s -= RW; if (s < RD) return [RX1, RZ1 - s, -1, 0];
      s -= RD; if (s < RW) return [RX1 - s, RZ0, 0, 1];
      s -= RW; return [RX0, RZ0 + s, 1, 0];
    }
    const segOf = s => { s = wrapS(s); return s < RW ? 0 : s < RW + RD ? 1 : s < 2 * RW + RD ? 2 : 3; };
    const TN = 240, TSTEP = 0.028;               // trail ≈ 6.7 units, about 40% of a lap
    const hist = new Float32Array(TN); for (let i = 0; i < TN; i++) hist[i] = -i * TSTEP;
    const run = { s: 0, v: 0, travel: 0, flare: 0, seg: 0, last: 0 };
    const ribbonMat = (alpha, pw) => new THREE.ShaderMaterial({
      uniforms: { uBeat: { value: 0 }, uFlare: { value: 0 }, uA: { value: alpha }, uP: { value: pw }, cCol: { value: new THREE.Color(0x22d3ee) }, cHot: { value: new THREE.Color(0xd9fbff) } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'attribute float aT; attribute float aV; varying float vT; varying float vV; void main(){ vT=aT; vV=aV; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `uniform float uBeat,uFlare,uA,uP; uniform vec3 cCol,cHot; varying float vT; varying float vV;
        void main(){
          float tail=pow(1.0-vT,uP);
          float hot=pow(1.0-vT,14.0);
          float edge=1.0-vV*0.75;
          vec3 c=mix(cCol,cHot,hot*0.85)*tail*edge*uA*(1.0+uBeat*0.9+uFlare*hot*1.5);
          gl_FragColor=vec4(c,1.0);
        }`
    });
    function ribbon(mat, kind) {
      const g = new THREE.BufferGeometry(), pos = new Float32Array(TN * 2 * 3), aT = new Float32Array(TN * 2), aV = new Float32Array(TN * 2), idx = [];
      for (let i = 0; i < TN; i++) { aT[i * 2] = aT[i * 2 + 1] = i / (TN - 1); aV[i * 2] = 0; aV[i * 2 + 1] = 1; if (i < TN - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('aT', new THREE.BufferAttribute(aT, 1)); g.setAttribute('aV', new THREE.BufferAttribute(aV, 1)); g.setIndex(idx);
      const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 5; m.userData.kind = kind; scene.add(m); return m;
    }
    const wall = ribbon(ribbonMat(1.15, 1.4), { h: 0.075 });
    const halo = ribbon(ribbonMat(0.22, 2.2), { h: 0.24 });
    const glowFloor = ribbon(ribbonMat(0.32, 1.8), { w: 0.18 });
    const spriteCan = document.createElement('canvas'); spriteCan.width = spriteCan.height = 128;
    const drawSprite = () => { const g = spriteCan.getContext('2d'); g.clearRect(0, 0, 128, 128); const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, `rgba(${THEME.tint(0.9)},1)`); rg.addColorStop(0.18, `rgba(${THEME.tint(0.4)},.85)`); rg.addColorStop(0.5, `rgba(${THEME.rgb},.25)`); rg.addColorStop(1, `rgba(${THEME.rgb},0)`); g.fillStyle = rg; g.fillRect(0, 0, 128, 128); }; drawSprite();
    const headSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(spriteCan), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    headSprite.renderOrder = 6; scene.add(headSprite);
    const headLight = new THREE.PointLight(0x22d3ee, 2.4, 2.6, 2); scene.add(headLight);
    function writeRibbon(m) {
      const p = m.geometry.attributes.position.array, k = m.userData.kind, y0 = 0.006;
      for (let i = 0; i < TN; i++) {
        const [x, z, nx, nz] = perim(i === 0 ? run.s : hist[i]), o = i * 6;
        p[o] = x; p[o + 1] = y0; p[o + 2] = z;
        if (k.w) { p[o + 3] = x + nx * k.w; p[o + 4] = y0; p[o + 5] = z + nz * k.w; }
        else { p[o + 3] = x; p[o + 4] = y0 + k.h; p[o + 5] = z; }
      }
      m.geometry.attributes.position.needsUpdate = true;
    }
    function runnerUpdate() {
      const dt = Math.min(0.05, Math.max(0, clock - (run.last || clock))); run.last = clock;
      const ti = trackAt(D.t), rate = D.vel / NOM;
      let target;
      if (reduce) target = PER / 30;
      else if (D.audible && ti >= 0) target = PER * TRACKS[ti].bpm * rate / 480;   // half time: one lap every two bars, signed with the record
      else target = (PER / 14) * (D.motor ? 1.6 : 1) * (D.audible ? Math.max(-6, Math.min(6, rate)) : 1);
      target = clamp(target, -PER * 1.6, PER * 1.6);
      run.v = lerp(run.v, target, 1 - Math.exp(-dt * (D.grab || D.backspin > 0 ? 16 : 3.5)));
      const ds = run.v * dt, dir = Math.sign(ds) || 1;
      run.s += ds; run.travel += Math.abs(ds);
      while (run.travel >= TSTEP) { run.travel -= TSTEP; hist.copyWithin(1, 0, TN - 1); hist[0] = run.s - dir * run.travel; }
      const seg = segOf(run.s);
      if (seg !== run.seg) { run.seg = seg; if (!reduce) run.flare = 1; }
      run.flare *= Math.exp(-dt * 5);
      [wall, halo, glowFloor].forEach(m => { writeRibbon(m); m.material.uniforms.uBeat.value = beat; m.material.uniforms.uFlare.value = run.flare; });
      const [hx, hz] = perim(run.s);
      headSprite.position.set(hx, 0.05, hz); const sc = 0.32 * (1 + run.flare * 0.9 + beat * 0.35); headSprite.scale.set(sc, sc, 1);
      headLight.position.set(hx, 0.16, hz); headLight.intensity = 2.0 + run.flare * 2.5 + beat * 1.5;
    }
    const topCan = document.createElement('canvas'); topCan.width = 2048; topCan.height = Math.round(2048 * PD / PW);
    const topTex = new THREE.CanvasTexture(topCan); topTex.encoding = THREE.sRGBEncoding; topTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const top = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), new THREE.MeshStandardMaterial({ map: topTex, metalness: 0.45, roughness: 0.38 }));
    top.rotation.x = -Math.PI / 2; top.position.set(PCX, 0.001, 0); top.receiveShadow = true; scene.add(top);
    const toCan = (x, z) => [(x - X0) / PW * topCan.width, (z - Z0) / PD * topCan.height];
    function drawTop() {
      const g = topCan.getContext('2d'), W = topCan.width, H = topCan.height, s = W / PW;
      g.fillStyle = '#121317'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.fillRect(0, Math.random() * H, W, 1); }
      for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; g.fillRect(0, Math.random() * H, W, 1); }
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 3; g.strokeRect(3, 3, W - 6, H - 6);
      let [cx, cy] = toCan(0, 0);
      const well = g.createRadialGradient(cx, cy, 1.5 * s, cx, cy, 1.95 * s); well.addColorStop(0, 'rgba(0,0,0,.85)'); well.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = well; g.beginPath(); g.arc(cx, cy, 1.95 * s, 0, 7); g.fill();
      g.fillStyle = '#050506'; g.beginPath(); g.arc(cx, cy, 1.64 * s, 0, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 1.67 * s, 0, 7); g.stroke();
      const mono = px => `500 ${px}px ${PLEX}, ui-monospace, monospace`;
      g.fillStyle = 'rgba(237,235,230,.5)'; g.font = mono(0.07 * s); g.textAlign = 'center';
      let [x, y] = toCan(-1.45, 1.83); g.fillText('START · STOP', x, y);
      [x, y] = toCan(-0.92, 1.84); g.fillText('33', x, y); [x, y] = toCan(-0.6, 1.84); g.fillText('45', x, y);
      g.textAlign = 'right'; g.font = mono(0.055 * s);
      for (let v = -8; v <= 8; v += 2) {
        const z = 0.95 + v / 8 * 0.6; [x, y] = toCan(2.42, z);
        g.fillStyle = v === 0 ? `rgba(${THEME.rgb},.9)` : 'rgba(237,235,230,.45)';
        g.fillText((v > 0 ? '+' : '') + v, x, y + 0.02 * s); g.fillRect(x + 0.03 * s, y - 1, 0.05 * s, 2);
      }
      g.textAlign = 'center'; g.fillStyle = 'rgba(237,235,230,.5)'; g.font = mono(0.06 * s);
      [x, y] = toCan(2.62, 0.22); g.fillText('PITCH', x, y);
      g.textAlign = 'left'; g.fillStyle = 'rgba(237,235,230,.88)';
      g.font = `800 ${0.15 * s}px Anybody, "Arial Black", sans-serif`;
      if ('fontStretch' in g) try { g.fontStretch = 'ultra-expanded'; } catch (e) {}
      [x, y] = toCan(-1.72, -1.6); g.fillText('REYTEK', x, y);
      if ('fontStretch' in g) try { g.fontStretch = 'normal'; } catch (e) {}
      g.font = mono(0.055 * s); g.fillStyle = 'rgba(237,235,230,.42)';
      [x, y] = toCan(-1.72, -1.48); g.fillText('RT-1991 · DIRECT DRIVE · QUARTZ LOCK', x, y);
      g.fillStyle = `rgba(${THEME.rgb},.75)`; [x, y] = toCan(1.62, 1.84); g.textAlign = 'center'; g.fillText('CUE', x, y);
      topTex.needsUpdate = true;
    }
    drawTop();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 40px Anybody'), document.fonts.load(`500 20px ${PLEX}`)]).then(drawTop).catch(() => {});

    // platter with strobe dots
    const dotsCan = document.createElement('canvas'); dotsCan.width = 2048; dotsCan.height = 128;
    const maskCan = document.createElement('canvas'); maskCan.width = 2048; maskCan.height = 128;
    (() => {
      const g = dotsCan.getContext('2d'), m = maskCan.getContext('2d');
      const grd = g.createLinearGradient(0, 0, 0, 128); grd.addColorStop(0, '#5d626b'); grd.addColorStop(0.5, '#3b3e45'); grd.addColorStop(1, '#25272c');
      g.fillStyle = grd; g.fillRect(0, 0, 2048, 128); m.fillStyle = '#000'; m.fillRect(0, 0, 2048, 128);
      [[180, 26, 9], [183, 52, 8], [216, 78, 7], [222, 102, 6]].forEach(([n, y, rr]) => {
        for (let i = 0; i < n; i++) {
          const x = (i + 0.5) / n * 2048;
          g.fillStyle = '#c9ced6'; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
          m.fillStyle = '#fff'; m.beginPath(); m.arc(x, y, rr * 0.8, 0, 7); m.fill();
        }
      });
    })();
    const dotsTex = new THREE.CanvasTexture(dotsCan), maskTex = new THREE.CanvasTexture(maskCan);
    dotsTex.encoding = THREE.sRGBEncoding; dotsTex.wrapS = maskTex.wrapS = THREE.RepeatWrapping;
    const sideMat = new THREE.MeshStandardMaterial({ map: dotsTex, emissiveMap: maskTex, emissive: 0x22d3ee, emissiveIntensity: 0.12, metalness: 0.5, roughness: 0.32 });
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.6, 0.16, 160, 1), [sideMat, M.rubber, M.rubber]);
    platter.position.y = 0.08; platter.castShadow = true; platter.receiveShadow = true; scene.add(platter);

    // the record: one shader draws grooves, gaps, sheen, label and the light-trail glow
    const labelCan = document.createElement('canvas'); labelCan.width = labelCan.height = 1024;
    const labelTex = new THREE.CanvasTexture(labelCan); labelTex.minFilter = THREE.LinearMipmapLinearFilter;
    const covers = TRACKS.map(t => { const im = new Image(); im.src = t.label || t.cover; return im; });
    let labelFor = -1;
    function drawLabel(i) {
      const g = labelCan.getContext('2d'), S = 1024, c = S / 2, im = covers[i];
      g.clearRect(0, 0, S, S);
      g.save(); g.beginPath(); g.arc(c, c, c, 0, 7); g.clip();
      g.fillStyle = '#0b0d12'; g.fillRect(0, 0, S, S);
      if (TRACKS[i].label) {   // a finished label design: use it as is
        if (im.complete && im.naturalWidth) g.drawImage(im, 0, 0, S, S);
        g.restore(); g.fillStyle = '#d7dbe2'; g.beginPath(); g.arc(c, c, 14, 0, 7); g.fill();
        labelTex.needsUpdate = true; labelFor = i; return;
      }
      if (im.complete && im.naturalWidth) g.drawImage(im, 0, 0, S, S);
      const rg = g.createRadialGradient(c, c, c * 0.55, c, c, c); rg.addColorStop(0, 'rgba(5,6,8,0)'); rg.addColorStop(0.7, 'rgba(5,6,8,.55)'); rg.addColorStop(1, 'rgba(5,6,8,.92)');
      g.fillStyle = rg; g.fillRect(0, 0, S, S);
      g.strokeStyle = `rgba(${THEME.rgb},.8)`; g.lineWidth = 4; g.beginPath(); g.arc(c, c, c * 0.8, 0, 7); g.stroke();
      g.fillStyle = 'rgba(237,235,230,.92)'; g.font = `500 30px ${PLEX}, ui-monospace, monospace`; g.textAlign = 'center'; g.textBaseline = 'middle';
      const text = `REYTEK  ·  SIDE A  ·  33⅓ RPM  ·  A${i + 1}  ${TRACKS[i].title.toUpperCase()}  ·  `;
      const step = (Math.PI * 2) / text.length;
      for (let k = 0; k < text.length; k++) { g.save(); g.translate(c, c); g.rotate(-Math.PI / 2 + k * step); g.translate(0, -c * 0.89); g.fillText(text[k], 0, 0); g.restore(); }
      g.restore();
      g.fillStyle = '#d7dbe2'; g.beginPath(); g.arc(c, c, 18, 0, 7); g.fill();
      labelTex.needsUpdate = true; labelFor = i;
    }
    covers.forEach((im, i) => { im.onload = () => { if (labelFor === i || labelFor < 0) drawLabel(i); }; });
    D.setLabel = i => drawLabel(i);
    drawLabel(0);
    const bands = []; for (let i = 0; i < 8; i++) bands.push(new THREE.Vector2(i < TRACKS.length ? TRACKS[i].r0 : 0, i < TRACKS.length ? TRACKS[i].r1 : 0));
    const RU = {
      uAngle: { value: 0 }, uBeat: { value: 0 }, uNeedleR: { value: -1 }, uPlayOuter: { value: 0 }, uHoverO: { value: 0 }, uHoverI: { value: 0 },
      uLight: { value: -0.75 }, uRLead: { value: R_LEAD }, uRRun: { value: R_RUN }, uBand: { value: bands }, uNB: { value: TRACKS.length },
      uLabel: { value: labelTex }, cCyan: { value: new THREE.Color(0x22d3ee) },
      uShA: { value: new THREE.Vector2() }, uShB: { value: new THREE.Vector2() }, uShW: { value: 0.04 }, uSpot: { value: new THREE.Vector2(-0.6, -0.4) }
    };
    const rec = new THREE.Mesh(new THREE.CircleGeometry(R_REC, 180), new THREE.ShaderMaterial({
      uniforms: RU, extensions: { derivatives: true },
      vertexShader: 'varying vec2 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: `
        uniform float uAngle,uBeat,uNeedleR,uPlayOuter,uHoverO,uHoverI,uLight,uRLead,uRRun;
        uniform vec2 uBand[8]; uniform int uNB; uniform sampler2D uLabel; uniform vec3 cCyan;
        uniform vec2 uShA,uShB,uSpot; uniform float uShW;
        varying vec2 vW;
        float segD(vec2 p, vec2 a, vec2 b){ vec2 ab=b-a; float t=clamp(dot(p-a,ab)/dot(ab,ab),0.0,1.0); return length(p-(a+ab*t)); }
        void main(){
          float r=length(vW); float aw=atan(vW.y,vW.x); float al=aw-uAngle;
          vec3 col=vec3(0.013,0.013,0.016);
          float groove=step(uRRun,r)*step(r,uRLead);
          float band=0.0;
          for(int i=0;i<8;i++){ if(i>=uNB) break; if(r<=uBand[i].x && r>=uBand[i].y) band=1.0; }
          float ph=r*2200.0+sin(al*3.0+r*9.0)*0.8;
          float g=0.5+0.5*sin(ph); g=mix(g,0.5,clamp(fwidth(ph)/3.0,0.0,1.0));
          float fine=0.5+0.5*sin(r*640.0);
          col+=vec3(0.024)*groove*(g*band+0.35*fine*(1.0-band));
          float c=abs(cos(aw-uLight));
          float lobe=pow(c,18.0), lobe2=pow(c,90.0);
          col+=vec3(0.62,0.66,0.74)*lobe*groove*(0.07+0.15*band*g+0.24*(1.0-band));
          col+=vec3(0.9)*lobe2*groove*0.12;
          float dead=step(0.5,r)*step(r,uRRun);
          col+=vec3(0.5,0.53,0.6)*lobe*dead*0.3;
          float played=step(uNeedleR,r)*step(r,uPlayOuter)*step(0.0,uNeedleR);
          float tr=pow(0.5+0.5*sin(al*3.0-r*26.0),12.0)+0.5*pow(0.5+0.5*sin(al*5.0+r*61.0),20.0);
          col+=cCyan*played*(0.03+tr*(0.07+uBeat*0.22));
          col+=cCyan*0.1*step(uHoverI,r)*step(r,uHoverO)*(0.5+0.5*g);
          col+=cCyan*exp(-pow((r-uNeedleR)*120.0,2.0))*0.4*step(0.0,uNeedleR);
          if(r<0.5){
            vec2 lp=vec2(cos(al),sin(al))*r;
            vec3 lab=texture2D(uLabel,vec2(lp.x+0.5,0.5-lp.y)).rgb;
            col=lab*(0.9+0.2*lobe);
            if(r<0.035) col=vec3(0.55,0.57,0.6)*(0.6+0.7*lobe);
          }
          col+=vec3(0.06)*smoothstep(1.47,1.5,r)*lobe;
          col*=mix(0.5,1.08,smoothstep(3.4,0.2,length(vW-uSpot)));
          float sd=segD(vW,uShA,uShB), hd=length(vW-uShB);
          float shade=max(smoothstep(uShW,uShW*0.3,sd)*0.6, smoothstep(uShW*2.6,uShW*0.8,hd)*0.7);
          col*=1.0-shade;
          col*=smoothstep(1.5,1.494,r);
          gl_FragColor=vec4(col,1.0);
        }`
    }));
    rec.rotation.x = -Math.PI / 2; rec.position.y = 0.182; scene.add(rec);
    const recEdge = new THREE.Mesh(new THREE.CylinderGeometry(R_REC, R_REC, 0.02, 180, 1, true), M.black); recEdge.position.y = 0.172; scene.add(recEdge);
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.14, 24), M.chrome); spindle.position.y = 0.22; scene.add(spindle);

    // tonearm base
    const base = new THREE.Group(); base.position.set(PV.x, 0, PV.z); scene.add(base);
    const cyl = (rt, rb, h, mat, y, seg = 48) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.y = y; base.add(m); return m; };
    cyl(0.38, 0.4, 0.04, M.dark, 0.02); cyl(0.27, 0.27, 0.14, M.satin, 0.11); cyl(0.29, 0.29, 0.02, M.chrome, 0.19); cyl(0.13, 0.15, 0.2, M.chrome, 0.3);
    const skate = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 32), M.satin); skate.position.set(PV.x - 0.42, 0.03, PV.z - 0.25); scene.add(skate);
    const restS = (() => { const d = 1.95; return { x: PV.x + d * Math.cos(PHI_REST), z: PV.z + d * Math.sin(PHI_REST) }; })();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 20), M.satin); post.position.set(restS.x, 0.25, restS.z); scene.add(post);
    const cradle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.12), M.black); cradle.position.set(restS.x, 0.5, restS.z); scene.add(cradle);
    // arm: yaw (swing) > pitch (lift)
    const yaw = new THREE.Group(); yaw.position.set(PV.x, ARM_Y, PV.z); scene.add(yaw);
    const pitchG = new THREE.Group(); yaw.add(pitchG);
    const curve = new THREE.CatmullRomCurve3([V(-0.42, 0, 0), V(0.1, 0, 0), V(0.7, 0, 0.06), V(1.3, 0, -0.05), V(1.85, 0, 0.02), V(2.13, -0.01, 0.07)]);
    pitchG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.034, 14, false), M.chrome));
    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); pitchG.add(m); return m; };
    add(new THREE.BoxGeometry(0.22, 0.16, 0.22), M.satin, 0, 0, 0);
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 40), M.dark, -0.6, 0, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.165, 0.165, 0.03, 40), M.chrome, -0.44, 0, 0, 0, 0, Math.PI / 2);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 20), M.satin, 2.14, -0.01, 0.07, 0, 0, Math.PI / 2);
    add(new THREE.BoxGeometry(0.38, 0.026, 0.17), M.black, 2.32, -0.04, 0.035, 0, -0.12, 0);
    add(new THREE.BoxGeometry(0.16, 0.012, 0.025), M.satin, 2.36, -0.03, 0.16, 0, 0.2, 0);
    // long DJ cartridge with a cyan stripe, sloping down to the stylus
    add(new THREE.BoxGeometry(0.34, 0.09, 0.08), M.black, 2.33, -0.115, 0, 0, 0, -0.3);
    add(new THREE.BoxGeometry(0.3, 0.012, 0.082), M.cyan, 2.32, -0.066, 0, 0, 0, -0.3);
    add(new THREE.ConeGeometry(0.014, 0.06, 12), M.chrome, 2.45, -0.21, 0, Math.PI, 0, 0);
    const tipGlow = add(new THREE.SphereGeometry(0.02, 16, 12), M.led, 2.45, -0.235, 0);
    pitchG.traverse(o => { if (o.isMesh) o.castShadow = true; });
    base.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    [post, cradle, skate].forEach(o => { o.castShadow = true; });

    // controls
    const ctrl = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); scene.add(m); return m; };
    const startBtn = ctrl(new THREE.BoxGeometry(0.56, 0.07, 0.36), M.satin, -1.45, 0.035, 1.55);
    const b33 = ctrl(new THREE.BoxGeometry(0.26, 0.045, 0.15), M.satin, -0.92, 0.0225, 1.64);
    const b45 = ctrl(new THREE.BoxGeometry(0.26, 0.045, 0.15), M.satin, -0.6, 0.0225, 1.64);
    const led33 = ctrl(new THREE.BoxGeometry(0.16, 0.012, 0.02), M.led.clone(), -0.92, 0.05, 1.6);
    const led45 = ctrl(new THREE.BoxGeometry(0.16, 0.012, 0.02), M.led.clone(), -0.6, 0.05, 1.6);
    const slot = ctrl(new THREE.BoxGeometry(0.07, 0.012, 1.36), M.rubber, 2.62, 0.006, 0.95);
    const knob = ctrl(new THREE.BoxGeometry(0.32, 0.11, 0.14), M.satin, 2.62, 0.055, 0.95);
    const knobLine = ctrl(new THREE.BoxGeometry(0.3, 0.004, 0.012), M.cyan, 2.62, 0.112, 0.95);
    const detent = ctrl(new THREE.SphereGeometry(0.03, 16, 12), M.led.clone(), 2.85, 0.03, 0.95);
    const cueBtn = ctrl(new THREE.BoxGeometry(0.22, 0.05, 0.16), M.satin, 1.62, 0.025, 1.64);
    const target = ctrl(new THREE.CylinderGeometry(0.05, 0.055, 0.32, 20), M.dark, -1.62, 0.16, -1.0);
    ctrl(new THREE.SphereGeometry(0.045, 16, 12), M.cyan, -1.62, 0.33, -1.0);
    const controls = [startBtn, b33, b45, knob, slot, cueBtn, detent];
    [startBtn, b33, b45, knob, cueBtn, target].forEach(o => { o.castShadow = true; });

    // pointer: tonearm drag, scratching, tap-to-cue, hardware buttons
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    function rayFrom(e) { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, cam); }
    function onPlane(y) { plane.constant = -y; return ray.ray.intersectPlane(plane, hit) ? { x: hit.x, z: hit.z } : null; }
    function armDist(p) {
      const s = stylusAt(D.phi), ax = s.x - PV.x, az = s.z - PV.z, t = clamp(((p.x - PV.x) * ax + (p.z - PV.z) * az) / (ax * ax + az * az), 0, 1.05);
      return Math.hypot(p.x - (PV.x + ax * t), p.z - (PV.z + az * t));
    }
    const angOf = p => Math.atan2(p.z, p.x);
    const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
    canvas.addEventListener('pointerdown', e => {
      if (!A.ctx) startAudio();
      ensureWorklet().catch(() => {});
      rayFrom(e);
      const hits = ray.intersectObjects(controls, false);
      if (hits.length) {
        const o = hits[0].object;
        if (o === startBtn) { setSound(true); setMotor(!D.motor); D.press = 1; }
        else if (o === b33) setRpm(33); else if (o === b45) setRpm(45);
        else if (o === detent) zeroPitch();
        else if (o === cueBtn) { if (D.needle) liftNeedle(); else if (rAt(D.phi) <= R_LEAD + 0.01) dropAt(rToT(rAt(D.phi))); }
        else { D.pitchGlide = false; D.pitchDrag = true; const p = onPlane(0.06); if (p) setPitch((p.z - 0.95) / 0.6 * 8); canvas.setPointerCapture(e.pointerId); }
        return;
      }
      const pa = onPlane(ARM_Y);
      if (pa && armDist(pa) < (e.pointerType === 'touch' ? 0.4 : 0.22)) {
        D.armDrag = true; D.auto = null; liftNeedle(); canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
        setSound(true); return;
      }
      const pr = onPlane(0.182);
      if (pr && Math.hypot(pr.x, pr.z) < R_REC) {
        D.grab = true; D.grabA = angOf(pr); D.grabT = performance.now(); D.grabVel = 0;
        D.down = { x: e.clientX, y: e.clientY, t: performance.now(), r: Math.hypot(pr.x, pr.z) };
        canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
      }
    });
    canvas.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') D.hover = true; });
    canvas.addEventListener('pointerleave', () => { D.hover = false; D.engageUntil = clock + 1.2; });
    canvas.addEventListener('pointermove', e => {
      rayFrom(e);
      if (D.armDrag) {
        const p = onPlane(ARM_Y); if (!p) return;
        let phi = Math.atan2(p.z - PV.z, p.x - PV.x); if (phi < 0) phi += 2 * Math.PI;
        D.phi = clamp(phi, PHI_REST, PHI_MAX);
        return;
      }
      if (D.pitchDrag) { const p = onPlane(0.06); if (p) setPitch((p.z - 0.95) / 0.6 * 8); return; }
      if (D.grab) {
        const p = onPlane(0.182); if (!p) return;
        const a = angOf(p), da = wrap(a - D.grabA), now = performance.now(), dt = Math.max(1, now - D.grabT) / 1000;
        D.grabA = a; D.grabT = now; D.angle += da;
        D.grabVel = lerp(D.grabVel, da / (2 * Math.PI) / dt, 0.6);
        return;
      }
      const hits = ray.intersectObjects(controls, false), pa = onPlane(ARM_Y), pr = onPlane(0.182);
      canvas.style.cursor = hits.length ? 'pointer' : (pa && armDist(pa) < 0.22) || (pr && Math.hypot(pr.x, pr.z) < R_REC) ? 'grab' : '';
    });
    function release(e) {
      if (D.armDrag) {
        D.armDrag = false; const r = rAt(D.phi);
        if (r <= R_LEAD + 0.01 && r >= R_RUN) dropAt(rToT(r));
        else D.auto = { phi: PHI_REST, drop: false };
      }
      if (D.grab) {
        D.grab = false;
        const d = D.down; D.down = null;
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6 && performance.now() - d.t < 300 && !D.needle && d.r <= R_LEAD && d.r >= R_RUN) {
          setSound(true); const t = rToT(d.r), ti = trackAt(t); if (ti >= 0) { D.sel = ti; loadTrack(ti); }
          cueTo(t, false);
        }
      }
      D.pitchDrag = false; canvas.style.cursor = '';
      D.engageUntil = clock + (e.pointerType === 'mouse' ? 1.2 : 4);
    }
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('dblclick', e => { rayFrom(e); const h = ray.intersectObjects([knob, slot, detent], false); if (h.length) zeroPitch(); });
    canvas.addEventListener('pointercancel', release);

    // camera fit + intro sweep
    let W = 0, H = 0;
    function resize() {
      const r = dk.stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    }
    resize(); if (window.ResizeObserver) { const ro = new ResizeObserver(resize); ro.observe(dk.stage); CLEAN.push(() => ro.disconnect()); } addEventListener('resize', resize); CLEAN.push(() => removeEventListener('resize', resize)); D.renderer = renderer;
    const proj = new THREE.Vector3();
    function screenOf(x, y, z) { proj.set(x, y, z).project(cam); return { x: (proj.x * 0.5 + 0.5) * W, y: (-proj.y * 0.5 + 0.5) * H }; }

    D.screen = (x, y, z) => screenOf(x, y, z);
    // camera: a low three-quarter "hero" angle at rest, rising to a steadier top-down view while you play.
    // It never moves mid-drag, so the arm and record stay exactly under your pointer.
    const corners = []; [X0, X1].forEach(x => [Z0, Z1].forEach(z => [-0.36, 0.62].forEach(y => corners.push(new THREE.Vector3(x, y, z)))));
    const cv = new THREE.Vector3();
    let camDist = 12, el = 0.3, yawA = 0.36, fovA = 22;
    function placeCam(d) {
      const tx = PCX - 0.05, tz = 0.05;
      cam.position.set(tx + Math.sin(yawA) * d * Math.cos(el), d * Math.sin(el), tz + Math.cos(yawA) * d * Math.cos(el));
      cam.lookAt(tx, 0.05, tz); cam.updateMatrixWorld();
    }
    function fitCam() {
      for (let k = 0; k < 3; k++) {
        placeCam(camDist);
        let m = 0; corners.forEach(c => { cv.copy(c).project(cam); m = Math.max(m, Math.abs(cv.x), Math.abs(cv.y)); });
        camDist *= m / 0.95;
      }
      placeCam(camDist);
    }
    // theme: live colors on lights and materials while it fades, canvas textures redrawn once it lands
    const ribbons = [wall, halo, glowFloor];
    THEME.on(t => {
      const [r, g, b] = t.c, hot = t.tint(0.78).split(',').map(v => v / 255);
      M.cyan.emissive.setRGB(r, g, b); M.cyan.color.setRGB(r * 0.27, g * 0.27, b * 0.27);
      [M.led, led33.material, led45.material, detent.material].forEach(m => m.emissive.setRGB(r, g, b)); sideMat.emissive.setRGB(r, g, b);
      back.color.setRGB(r, g, b); rim.color.setRGB(r, g, b); headLight.color.setRGB(r, g, b);
      RU.cCyan.value.setRGB(r, g, b);
      ribbons.forEach(m => { m.material.uniforms.cCol.value.setRGB(r, g, b); m.material.uniforms.cHot.value.setRGB(hot[0], hot[1], hot[2]); });
    });
    THEME.onSettle(() => {
      MATCAPS.forEach(([o, c, t]) => matcap(o, c, t));
      drawSprite(); headSprite.material.map.needsUpdate = true;
      drawTop(); if (labelFor >= 0) drawLabel(labelFor);
    });
    D.render = (sp, mx, my) => {
      const busy = D.armDrag || D.grab || D.pitchDrag;
      const want = (D.hover || busy || D.auto || clock < (D.engageUntil || 0)) ? 1 : 0;
      if (!busy) D.engage = lerp(D.engage || 0, want, 0.045);
      const e = ease(clamp(D.engage || 0)), intro = ease(clamp(sp));
      if (!busy) {
        el = lerp(lerp(0.2, 0.66, intro), 1.0, e);
        yawA = lerp(0.36, 0.04, e) + mx * 0.025;
        const f = lerp(22, 26, e); if (Math.abs(f - fovA) > 0.01) { fovA = f; cam.fov = f; cam.updateProjectionMatrix(); }
        fitCam();
      }
      // arm shadow on the record, projected from the key light
      const proj2 = (x, y, z) => { const t = (LIGHT.y - 0.182) / (LIGHT.y - y); return new THREE.Vector2(LIGHT.x + (x - LIGHT.x) * t, LIGHT.z + (z - LIGHT.z) * t); };
      const la = D.lift * 0.075, armPt = (lx, ly) => { const x = lx * Math.cos(la) - ly * Math.sin(la), y = lx * Math.sin(la) + ly * Math.cos(la); return [PV.x + x * Math.cos(D.phi), ARM_Y + y, PV.z + x * Math.sin(D.phi)]; };
      const pa = armPt(-0.6, 0), pb = armPt(2.32, -0.08);
      RU.uShA.value.copy(proj2(...pa)); RU.uShB.value.copy(proj2(...pb));
      RU.uShW.value = 0.035 + D.lift * 0.03;
      platter.rotation.y = -D.angle;
      RU.uAngle.value = D.angle; RU.uBeat.value = beat;
      const tr = D.loaded >= 0 ? TRACKS[D.loaded] : TRACKS[D.sel];
      const ti = trackAt(D.t);
      RU.uNeedleR.value = D.audible ? rAt(D.phi) : -1;
      RU.uPlayOuter.value = D.audible && ti >= 0 ? TRACKS[ti].r0 : 0;
      const hr = D.armDrag ? rAt(D.phi) : -1, ht = hr > 0 ? trackAt(rToT(hr)) : -1;
      RU.uHoverO.value = ht >= 0 ? TRACKS[ht].r0 : 0; RU.uHoverI.value = ht >= 0 ? TRACKS[ht].r1 : 0;
      sideMat.emissiveIntensity = 0.1 + beat * (D.audible ? 1.6 : 0.3);
      yaw.rotation.y = -D.phi; pitchG.rotation.z = D.lift * 0.075;
      M.led.emissiveIntensity = D.audible ? 1.2 + beat * 2 : 0;
      led33.material.emissiveIntensity = D.rpm === 33 ? 1.4 : 0.05; led45.material.emissiveIntensity = D.rpm === 45 ? 1.4 : 0.05;
      detent.material.emissiveIntensity = D.pitch === 0 ? 1.6 : 0.05;
      knob.position.z = knobLine.position.z = 0.95 + D.pitch / 8 * 0.6;
      D.press = (D.press || 0) * 0.85; startBtn.position.y = 0.035 - D.press * 0.02;
      rim.intensity = 1.2 + beat * 2.2;
      runnerUpdate();
      renderer.render(scene, cam);
      // hint + tooltip anchored to the headshell
      const s = stylusAt(D.phi), sp2 = screenOf(s.x, ARM_Y + D.lift * 0.18 - 0.1, s.z);
      // keep both labels inside the stage: the hint slides along the edge, the tip flips to the other side of the needle
      const PAD = 6, clampX = (x, w) => Math.min(Math.max(x, PAD), Math.max(PAD, W - w - PAD)), clampY = (y, h) => Math.min(Math.max(y, PAD), Math.max(PAD, H - h - PAD));
      const hw = dk.hint.offsetWidth, hh = dk.hint.offsetHeight;
      const hx = clampX(sp2.x - hw / 2, hw), hy = clampY(sp2.y - hh * 1.5, hh);
      dk.hint.style.transform = `translate(${hx}px,${hy}px)`;
      dk.hint.style.setProperty('--ax', `${Math.min(Math.max(sp2.x - hx, 12), hw - 12)}px`);
      dk.hint.style.opacity = D.started || D.armDrag || D.auto ? 0 : 1;
      let tipText = null;
      if (D.armDrag && ht >= 0) tipText = `A${ht + 1} · ${TRACKS[ht].title} · ${fmt(rToT(hr) - TRACKS[ht].start)}`;
      else if (D.armDrag) tipText = hr > R_LEAD ? 'Off the record · release to rest' : hr > R_OUT ? 'Lead-in' : 'Run-out';
      if (tipText !== null) {
        dk.tip.hidden = false;
        if (dk.tip.textContent !== tipText) dk.tip.textContent = tipText;
        const tw = dk.tip.offsetWidth, th = dk.tip.offsetHeight;
        let tx = sp2.x + 18; if (tx + tw > W - PAD) tx = sp2.x - 18 - tw;
        dk.tip.style.transform = `translate(${clampX(tx, tw)}px,${clampY(sp2.y - th / 2, th)}px)`;
      } else dk.tip.hidden = true;
    };
    D.built = true;
  }

  // ---- per-frame physics, audio sync, readout ----
  let roTick = 0;
  function deckFrame(dt) {
    // platter motor, scratch, backspin
    const target = D.motor ? NOM * (D.rpm / (100 / 3)) * (1 + D.pitch / 100) : 0;
    if (D.grab) { D.vel = D.grabVel; D.grabVel *= Math.exp(-dt * 10); }
    else if (D.backspin > 0) { D.backspin -= dt; D.vel = lerp(D.vel, target, 1 - Math.exp(-dt * 1.7)); if (D.backspin <= 0) finishBackspin(); }
    else { const acc = D.motor ? 2.4 : 0.7, dv = target - D.vel; D.vel += clamp(dv, -acc * dt, acc * dt); }
    if (!D.grab) D.angle += D.vel * 2 * Math.PI * dt;

    // pitch glides home when reset, like easing the fader back by hand
    if (D.pitchGlide) {
      const p = D.pitch * Math.exp(-dt * 7);
      if (Math.abs(p) < 0.04) { D.pitchGlide = false; setPitch(0, true); } else setPitch(p, true);
    }

    // arm motion and needle lift
    if (D.auto) {
      const k = 1 - Math.exp(-dt * (D.auto.fast ? 16 : 6.5));
      D.phi += (D.auto.phi - D.phi) * k;
      if (Math.abs(D.auto.phi - D.phi) < 0.003) { D.phi = D.auto.phi; const a = D.auto; D.auto = null; if (a.drop) dropAt(a.t); }
    } else if (D.needle && !D.armDrag) D.phi = phiForR(tToR(D.t));
    const atRest = !D.needle && !D.armDrag && !D.auto && Math.abs(D.phi - PHI_REST) < 0.01;
    const liftT = D.needle ? 0 : (atRest ? 0.62 : 1);
    D.lift += (liftT - D.lift) * (1 - Math.exp(-dt * (D.needle ? 6 : 16)));
    const audible = D.needle && D.lift < 0.05;
    if (audible && !D.audible) { needleSound(true); seekWorklet(); resetBeats(); }
    if (!audible && D.audible) needleSound(false);
    D.audible = audible;
    updatePlayIcons();

    // playback position: follow the worklet when it has the track, else integrate
    const rate = D.audible ? D.vel / NOM : 0;
    if (D.audible) {
      const running = A.ctx && A.ctx.state === 'running';
      if (D.loaded >= 0 && D.rep && running) {
        const now = performance.now() / 1000;
        D.t = TRACKS[D.loaded].start + D.rep.pos + rate * clamp(now - D.rep.at, 0, 0.3);
      } else if (running) D.t += rate * dt;
      if (D.t >= D.tMax || D.t <= -LEAD) {
        D.t = clamp(D.t, -LEAD, D.tMax); seekWorklet();
        if (D.t >= D.tMax) { const rev = Math.floor(D.angle / (2 * Math.PI)); if (rev !== D.lockRev) { D.lockRev = rev; needleSound(false); } }
      }
      const ti = trackAt(D.t);
      if (ti >= 0 && ti !== D.loaded && ti !== D.loadingId) { D.sel = ti; loadTrack(ti); }
    }
    if (D.node) {
      if (D.fxLp) {
        const over = Math.max(0, Math.abs(rate) - 1.15), spin = D.backspin > 0 ? 1 : 0;
        const gTarget = (D.grab ? 0.8 : 1) / (1 + 0.9 * Math.pow(over, 1.15) + spin * 2.6);
        const fTarget = spin ? 2200 : over > 0 ? Math.max(900, 14000 / (1 + over * 3.5)) : (D.grab ? 9000 : 20000);
        const t = A.ctx.currentTime;
        // only touch the audio graph when the target really changes (automation events pile up otherwise)
        if (Math.abs(gTarget - (D.fxG || 1)) > 0.01 || Math.abs(fTarget - (D.fxF || 20000)) > 50) {
          D.fxGain.gain.cancelScheduledValues(t); D.fxGain.gain.setTargetAtTime(gTarget, t, 0.03);
          D.fxLp.frequency.cancelScheduledValues(t); D.fxLp.frequency.setTargetAtTime(fTarget, t, 0.03);
          D.fxG = gTarget; D.fxF = fTarget;
        }
      }
      if (Math.abs(rate - D.lastRate) > 0.0004 || (rate === 0 && D.lastRate !== 0)) { D.node.port.postMessage({ t: 'rate', v: rate }); D.lastRate = rate; }
      if (D.audible !== D.sentNeedle) { D.node.port.postMessage({ t: 'needle', v: D.audible }); D.sentNeedle = D.audible; }
    }

    // beats from the real track drive the vortex
    if (D.audible && D.loaded >= 0) {
      const tr = TRACKS[D.loaded], local = D.t - tr.start;
      if (local < D.lastLocal - 0.05 || local > D.lastLocal + 1) resetBeats();
      else if (rate > 0.2) while (D.beatIdx < tr.beats.length && tr.beats[D.beatIdx] <= local) { D.beatIdx++; beat = 1; justBeat = true; D.beatNo = D.beatIdx; }
      D.lastLocal = local;
    }

    // the generated loop steps aside while the deck is in use
    const hold = D.needle || D.armDrag || D.motor || D.backspin > 0 || !!D.auto;
    if (hold !== D.hold) {
      D.hold = hold;
      if (A.loop) { A.loop.gain.cancelScheduledValues(A.ctx.currentTime); A.loop.gain.setTargetAtTime(hold ? 0 : 1, A.ctx.currentTime, hold ? 0.06 : 0.8); }
    }

    // readout (10x a second is plenty)
    roTick += dt;
    if (roTick > 0.1) {
      roTick = 0;
      const ti = trackAt(D.t), seg = segAt(D.t);
      const si = D.audible && ti >= 0 ? ti : D.sel;
      showTrack(si);
      const tr = TRACKS[si];
      let st = 'Standby';
      if (D.backspin > 0) st = 'Backspin';
      else if (D.armDrag) st = 'Cueing';
      else if (D.grab && D.audible) st = 'Scratch';
      else if (D.audible && D.loadingId >= 0) st = 'Loading';
      else if (D.audible) st = seg.k === 'track' ? (Math.abs(D.vel) < 0.02 ? 'Paused' : 'Playing') : seg.k === 'lead' ? 'Lead-in' : seg.k === 'gap' ? 'Gap' : 'Run-out';
      else if (D.auto) st = 'Cueing';
      else if (D.motor) st = 'Spinning';
      dk.state.textContent = st;
      dk.time.textContent = (ti === si ? fmt(D.t - tr.start) : '0:00') + ' / ' + fmt(tr.dur);
      const eff = D.vel / NOM;
      dk.pitchOut.textContent = (D.pitch > 0 ? '+' : '') + D.pitch.toFixed(1) + '%';
      dk.rpmOut.textContent = D.rpm === 33 ? '33⅓' : '45';
      dk.bpmOut.textContent = D.audible && ti >= 0 ? (TRACKS[ti].bpm * Math.abs(eff)).toFixed(1) : TRACKS[D.sel].bpm.toFixed(1);
      dk.beatOut.textContent = D.audible && ti >= 0 ? String((Math.max(0, D.beatNo - 1) % 4) + 1) : '·';
    }
    if (D.visible) drawWave();
  }

  // build when the section first comes near, render only while visible
  if ('IntersectionObserver' in window) {
    const IO1 = new IntersectionObserver(es => es.forEach(en => {
      D.near = en.isIntersecting;
      if (en.isIntersecting) {
        if (!D.built) { try { deckBuild(); } catch (err) { console.warn(err); dk.stage.classList.add('no-deck'); } }
        fetchBytes(D.sel).catch(() => {});
      }
    }), { rootMargin: '600px 0px' }); IO1.observe(dk.stage); CLEAN.push(() => IO1.disconnect());
    const IO2 = new IntersectionObserver(es => es.forEach(en => { D.visible = en.isIntersecting; }), { rootMargin: '80px 0px' }); IO2.observe(dk.stage); CLEAN.push(() => IO2.disconnect());
  }

// ===================================================================================

  const mouse = { x: 0, y: 0 };
  const onMove = e => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove, { passive: true }); CLEAN.push(() => removeEventListener('pointermove', onMove));
  let raf = 0, last = performance.now();
  const loop = now => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    clock += dt; beat *= Math.exp(-dt * 6.5); justBeat = false;
    if (!D.near && !D.needle && !D.motor && !D.auto && Math.abs(D.vel) < 0.001) return;
    deckFrame(dt);
    if (D.built && D.visible) { const mr = host.getBoundingClientRect(); D.render((innerHeight - mr.top) / (innerHeight * 0.85), mouse.x, mouse.y); }
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf); CLEAN.forEach(f => f());
    try { if (D.node) D.node.disconnect(); if (A.ctx) A.ctx.close(); } catch (e) {}
    try { if (D.renderer) { D.renderer.dispose(); D.renderer.forceContextLoss(); } } catch (e) {}
    host.innerHTML = '';
  };
}
