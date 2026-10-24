// Five moons, waxing to full: the restaurant's mark.
const PHASES = [0.25, 0.45, 0.65, 0.85, 1];

export function Moons({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 78 12" className={className} fill="currentColor">
      <defs>
        {PHASES.map((ph, i) => (
          <mask key={i} id={`moon-${i}`} maskUnits="userSpaceOnUse" x={i * 16} y="0" width="14" height="12">
            <circle cx={i * 16 + 7} cy="6" r="5" fill="white" />
            {ph < 1 && <circle cx={i * 16 + 7 - ph * 10} cy="6" r="5" fill="black" />}
          </mask>
        ))}
      </defs>
      {PHASES.map((_, i) => (
        <g key={i}>
          <circle cx={i * 16 + 7} cy="6" r="5" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
          <circle cx={i * 16 + 7} cy="6" r="5" mask={`url(#moon-${i})`} />
        </g>
      ))}
    </svg>
  );
}
