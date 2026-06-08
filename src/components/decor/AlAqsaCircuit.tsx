export function AlAqsaCircuit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Green circuit top */}
      <g stroke="#064E3B" strokeWidth="1.2" opacity="0.45">
        <path d="M80 20 H320 M100 40 H300 M60 60 H340 M120 80 H280" />
        <path d="M200 20 V100 M160 40 V80 M240 60 V90" />
        <circle cx="320" cy="20" r="4" fill="#064E3B" />
        <circle cx="340" cy="60" r="4" fill="#064E3B" />
        <circle cx="280" cy="80" r="4" fill="#064E3B" />
      </g>
      {/* Al-Aqsa line art */}
      <g stroke="#1a1a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Dome of the Rock */}
        <path d="M120 280 Q200 180 280 280" />
        <path d="M130 280 Q200 200 270 280" />
        <ellipse cx="200" cy="278" rx="78" ry="12" />
        <path d="M200 200 L200 170" />
        <path d="M200 170 L195 155 M200 170 L205 155" />
        {/* Main building walls */}
        <rect x="100" y="278" width="200" height="80" rx="2" />
        <path d="M100 310 H300 M100 340 H300" />
        {/* Minarets */}
        <path d="M115 278 V220 M115 220 L108 200 M115 220 L122 200" />
        <path d="M115 230 L110 225 M115 230 L120 225" />
        <path d="M285 278 V210 M285 210 L278 188 M285 210 L292 188" />
        <path d="M285 225 L280 220 M285 225 L290 220" />
        {/* Arches */}
        <path d="M140 358 Q155 330 170 358" />
        <path d="M175 358 Q190 330 205 358" />
        <path d="M210 358 Q225 330 240 358" />
        <path d="M245 358 Q260 330 275 358" />
        {/* Trees left */}
        <path d="M70 358 L70 310 M70 320 L55 305 M70 320 L85 305 M70 300 L58 290 M70 300 L82 290" />
        <path d="M50 358 L50 325 M50 330 L40 318 M50 330 L60 318" />
      </g>
    </svg>
  );
}
