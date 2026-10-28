import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared look for every page's link preview (1200×630): paper, ink, one cobalt cell lifting off the grid. */
export const ogSize = { width: 1200, height: 630 };
export const ogType = "image/png";

const font = (f: string) => readFile(join(process.cwd(), "assets/og", f));

const INK = "#14171F";
const PAPER = "#F7F5EF";
const COBALT = "#1F3FFF";
const MUTED = "#5A6070";

// the mark from app/icon.svg, in 98-unit space
const CELLS = [[8, 14], [36, 14], [8, 42], [36, 42], [64, 42], [8, 70], [36, 70], [64, 70]];

function MarkArt({ s }: { s: number }) {
  const u = s / 98;
  return (
    <div style={{ display: "flex", position: "relative", width: s, height: s }}>
      {CELLS.map(([x, y]) => (
        <div key={`${x}-${y}`} style={{ position: "absolute", left: (x - 4) * u, top: (y + 2) * u, width: 22 * u, height: 22 * u, borderRadius: 3 * u, background: INK }} />
      ))}
      <div style={{ position: "absolute", left: 72 * u, top: 2 * u, width: 22 * u, height: 22 * u, borderRadius: 3 * u, background: COBALT }} />
    </div>
  );
}

export async function ogImage({ kicker, title, sub, tags }: { kicker: string; title: string; sub: string; tags: string[] }) {
  const [display, sans, mono] = await Promise.all([font("bricolage-700.woff"), font("public-sans-400.woff"), font("plex-mono-500.woff")]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: PAPER, color: INK, padding: "64px 72px", fontFamily: "Public Sans" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <MarkArt s={64} />
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 40, letterSpacing: -1.2 }}>
            <span>Launch</span><span style={{ color: COBALT }}>Grid</span><span style={{ marginLeft: 12 }}>Studio</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontFamily: "Plex Mono", fontSize: 24, letterSpacing: 2, textTransform: "uppercase", color: MUTED }}>{kicker}</div>
          <div style={{ fontFamily: "Bricolage", fontSize: 76, lineHeight: 1.02, letterSpacing: -2.6, maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: MUTED, maxWidth: 940 }}>{sub}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.map((t) => (
              <div key={t} style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 20, letterSpacing: 1.5, textTransform: "uppercase", border: `2px solid ${INK}`, borderRadius: 8, padding: "8px 14px" }}>{t}</div>
            ))}
          </div>
          <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 24, color: COBALT }}>launchgrid.studio</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Bricolage", data: display, weight: 700, style: "normal" },
        { name: "Public Sans", data: sans, weight: 400, style: "normal" },
        { name: "Plex Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}

/** Square icon for home screens (apple-icon): the mark on paper, no transparency. */
export function markIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: PAPER }}>
        <MarkArt s={Math.round(size * 0.68)} />
      </div>
    ),
    { width: size, height: size },
  );
}
