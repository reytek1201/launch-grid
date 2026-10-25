import type { ReactNode } from "react";

/*
 * Aged paper frame: warm off-white stock with grain, darkened burnt edges,
 * a torn outline (SVG filter in PaperDefs) and an optional strip of tape.
 * The paper is a separate layer so the photo itself stays crisp.
 * `flat`: for tall cards (forms, long lists). iPhone Safari cannot draw a CSS or SVG filter on
 * something thousands of pixels tall, so these use a clip-path edge and a plain shadow layer instead.
 */
export function RusticCard({
  children,
  tape = true,
  className = "",
  pad = "p-2.5 pb-3",
  flat = false,
}: {
  children: ReactNode;
  tape?: boolean;
  className?: string;
  pad?: string;
  flat?: boolean;
}) {
  return (
    <div className={`relative ${flat ? "" : "drop-shadow-[0_18px_28px_rgb(20_12_8/0.5)]"} ${pad} ${className}`}>
      {flat && <div aria-hidden className="absolute inset-[3px] shadow-[0_18px_28px_rgb(20_12_8/0.5)]" />}
      <div aria-hidden className={`${flat ? "paper-flat" : "paper"} absolute inset-0`} />
      <div className="relative">{children}</div>
      {tape && <span aria-hidden className="tape" />}
    </div>
  );
}
