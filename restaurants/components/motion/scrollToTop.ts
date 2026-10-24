// One way to go home: smooth unless the visitor asked for less motion.
export function scrollToTop() {
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
}
