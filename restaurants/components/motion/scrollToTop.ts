// One way home: an eased glide whose length grows with the distance, so a long page
// does not flash past. Any wheel, touch or key press hands control straight back.
let stop: (() => void) | null = null;

export function scrollToTop() {
  stop?.();
  const from = window.scrollY;
  if (from < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, 0);
    return;
  }

  const ms = Math.min(3400, 1000 + Math.sqrt(from) * 24);
  const start = performance.now();
  const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2; // sine in-out: gentle start and stop, no sudden peak
  let frame = 0;

  const end = () => {
    cancelAnimationFrame(frame);
    for (const e of ["wheel", "touchstart", "keydown"]) window.removeEventListener(e, end);
    stop = null;
  };
  stop = end;
  for (const e of ["wheel", "touchstart", "keydown"]) window.addEventListener(e, end, { passive: true });

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    window.scrollTo(0, from * (1 - ease(t)));
    if (t < 1) frame = requestAnimationFrame(step);
    else end();
  };
  frame = requestAnimationFrame(step);
}
