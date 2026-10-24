import type { ReactNode } from "react";

/*
 * Aged paper frame: warm off-white stock with grain, darkened burnt edges,
 * a torn outline (SVG filter in PaperDefs) and an optional strip of tape.
 * The paper is a separate layer so the photo itself stays crisp.
 */
export function RusticCard({
  children,
  tape = true,
  className = "",
  pad = "p-2.5 pb-3",
}: {
  children: ReactNode;
  tape?: boolean;
  className?: string;
  pad?: string;
}) {
  return (
    <div className={`relative drop-shadow-[0_18px_28px_rgb(20_12_8/0.5)] ${pad} ${className}`}>
      <div aria-hidden className="paper absolute inset-0" />
      <div className="relative">{children}</div>
      {tape && <span aria-hidden className="tape" />}
    </div>
  );
}
