// Shared SVG filters: a rough, hand-torn edge for paper frames.
export function PaperDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="torn-edge" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
