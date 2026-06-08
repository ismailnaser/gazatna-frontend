export function TatreezCircuit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Tatreez embroidery pattern */}
      <g opacity="0.95">
        {[0, 40, 80, 120, 160].map((y) => (
          <g key={y}>
            <rect x="20" y={y} width="24" height="24" fill="#881337" />
            <rect x="44" y={y} width="24" height="24" fill="#064E3B" />
            <rect x="68" y={y} width="24" height="24" fill="#1a1a1a" />
            <rect x="92" y={y} width="24" height="24" fill="#881337" />
            <rect x="32" y={y + 12} width="24" height="24" fill="#064E3B" />
            <rect x="56" y={y + 12} width="24" height="24" fill="#881337" />
            <rect x="80" y={y + 12} width="24" height="24" fill="#064E3B" />
          </g>
        ))}
        {/* Diamond motifs */}
        {[30, 90, 150].map((y) => (
          <path
            key={`d-${y}`}
            d={`M110 ${y} l16 16 l-16 16 l-16 -16 z`}
            fill="#881337"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
        ))}
        {[60, 120, 180].map((y) => (
          <path
            key={`d2-${y}`}
            d={`M110 ${y} l12 12 l-12 12 l-12 -12 z`}
            fill="#064E3B"
            stroke="#881337"
            strokeWidth="1"
          />
        ))}
      </g>
      {/* Circuit transition */}
      <g stroke="#881337" strokeWidth="1.5" opacity="0.8">
        <path d="M40 220 H200 M60 240 H180 M80 260 H220 M50 280 H190 M70 300 H210" />
        <path d="M100 220 V320 M140 240 V340 M180 260 V330" />
        <circle cx="200" cy="220" r="4" fill="#881337" />
        <circle cx="220" cy="260" r="4" fill="#881337" />
        <circle cx="190" cy="300" r="4" fill="#881337" />
        <circle cx="210" cy="340" r="4" fill="#881337" />
      </g>
      <g stroke="#1a1a1a" strokeWidth="1" opacity="0.5">
        <path d="M30 360 H250 M50 380 H230 M70 400 H240 M40 420 H220" />
        <circle cx="250" cy="360" r="3" fill="#881337" />
        <circle cx="240" cy="400" r="3" fill="#881337" />
        <circle cx="230" cy="440" r="3" fill="#881337" />
      </g>
    </svg>
  );
}
