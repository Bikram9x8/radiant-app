// Hand-drawn SVG illustrations that match the pastel theme.

export function SchoolArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} role="img" aria-label="A school building with books and a pencil">
      <circle cx="120" cy="96" r="76" fill="#FFFFFF" opacity="0.55" />
      <circle cx="200" cy="36" r="16" fill="#FDE68A" />
      <ellipse cx="46" cy="40" rx="22" ry="9" fill="#FFFFFF" />
      <ellipse cx="62" cy="36" rx="14" ry="8" fill="#FFFFFF" />
      <rect x="20" y="146" width="200" height="8" rx="4" fill="#C4B5FD" />
      {/* building */}
      <rect x="70" y="86" width="100" height="60" rx="4" fill="#7C5CE8" />
      <polygon points="62,90 120,52 178,90" fill="#5B33D6" />
      <rect x="118.8" y="28" width="2.5" height="26" fill="#3B3A55" />
      <polygon points="121.3,28 139,34 121.3,40" fill="#F59E0B" />
      <rect x="108" y="108" width="24" height="38" rx="4" fill="#FDE68A" />
      <circle cx="127" cy="128" r="2" fill="#B45309" />
      <rect x="80" y="100" width="18" height="18" rx="3" fill="#EDE9FE" />
      <rect x="142" y="100" width="18" height="18" rx="3" fill="#EDE9FE" />
      <circle cx="120" cy="76" r="6" fill="#FDE68A" />
      {/* books */}
      <rect x="26" y="137" width="38" height="9" rx="2" fill="#F59E0B" />
      <rect x="28" y="128" width="34" height="9" rx="2" fill="#10B981" />
      <rect x="32" y="119" width="30" height="9" rx="2" fill="#F472B6" />
      {/* pencil */}
      <g transform="rotate(25 190 126)">
        <rect x="184" y="96" width="12" height="46" rx="2" fill="#F472B6" />
        <rect x="184" y="96" width="12" height="9" rx="2" fill="#3B3A55" />
        <polygon points="184,142 196,142 190,154" fill="#FDE68A" />
      </g>
    </svg>
  );
}

export function HigherArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" className={className} role="img" aria-label="A graduation cap above a laptop, with a briefcase and a coin">
      <circle cx="120" cy="96" r="76" fill="#FFFFFF" opacity="0.55" />
      <circle cx="40" cy="38" r="12" fill="#FDE68A" />
      <ellipse cx="196" cy="34" rx="20" ry="8" fill="#FFFFFF" />
      <rect x="20" y="152" width="200" height="8" rx="4" fill="#99F6E4" />
      {/* laptop */}
      <rect x="76" y="92" width="88" height="54" rx="6" fill="#134E4A" />
      <rect x="82" y="98" width="76" height="42" rx="3" fill="#CCFBF1" />
      <rect x="90" y="106" width="40" height="5" rx="2.5" fill="#5EEAD4" />
      <rect x="90" y="116" width="54" height="5" rx="2.5" fill="#99F6E4" />
      <rect x="90" y="126" width="30" height="5" rx="2.5" fill="#5EEAD4" />
      <rect x="62" y="146" width="116" height="10" rx="5" fill="#0F766E" />
      {/* graduation cap */}
      <path d="M96 52v16c0 9 48 9 48 0V52" fill="#3B3A55" />
      <polygon points="120,24 178,46 120,68 62,46" fill="#14142B" />
      <line x1="170" y1="49" x2="170" y2="76" stroke="#F59E0B" strokeWidth="3" />
      <circle cx="170" cy="80" r="5" fill="#F59E0B" />
      {/* briefcase */}
      <path d="M32 126v-6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v6" fill="none" stroke="#B45309" strokeWidth="3" />
      <rect x="22" y="126" width="40" height="28" rx="5" fill="#F59E0B" />
      <rect x="22" y="138" width="40" height="3" fill="#B45309" opacity="0.5" />
      <rect x="39" y="136" width="6" height="7" rx="1.5" fill="#FDE68A" />
      {/* coin */}
      <circle cx="198" cy="128" r="18" fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
      <rect x="191" y="121" width="14" height="3" rx="1.5" fill="#F59E0B" />
      <rect x="191" y="128" width="14" height="3" rx="1.5" fill="#F59E0B" />
      <rect x="194" y="121" width="3" height="16" rx="1.5" fill="#F59E0B" />
      {/* sparkles */}
      <path d="M208 78l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#F59E0B" />
      <path d="M30 80l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#0D9488" />
    </svg>
  );
}

// Small line drawing for a subject. It takes the colour of the text around it.
export function SubjectArt({ name, className = "" }: { name: string; className?: string }) {
  const n = name.toLowerCase();
  const common = {
    viewBox: "0 0 48 48",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (/math/.test(n)) {
    return (
      <svg {...common}>
        <rect x="11" y="6" width="26" height="36" rx="4" />
        <rect x="16" y="11" width="16" height="8" rx="1.5" />
        {[18, 24, 30].flatMap((x) =>
          [27, 34].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />)
        )}
      </svg>
    );
  }
  if (/chem/.test(n)) {
    return (
      <svg {...common}>
        <path d="M19 6h10M21 6v12L10 38a4 4 0 0 0 3.5 6h21A4 4 0 0 0 38 38L27 18V6" />
        <path d="M14 32h20" />
      </svg>
    );
  }
  if (/phys/.test(n)) {
    return (
      <svg {...common}>
        <ellipse cx="24" cy="24" rx="18" ry="7" />
        <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="18" ry="7" transform="rotate(-60 24 24)" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      </svg>
    );
  }
  if (/bio/.test(n)) {
    return (
      <svg {...common}>
        <path d="M10 38C10 20 22 10 38 10c0 16-10 28-28 28z" />
        <path d="M10 38l16-16" />
      </svg>
    );
  }
  if (/econom|account|business|commerce|financ|statistic/.test(n)) {
    return (
      <svg {...common}>
        <path d="M8 6v34h34" />
        <rect x="14" y="26" width="6" height="12" />
        <rect x="24" y="18" width="6" height="20" />
        <rect x="34" y="10" width="6" height="28" />
      </svg>
    );
  }
  if (/social|histor|geograph|civic|polit/.test(n)) {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="16" />
        <ellipse cx="24" cy="24" rx="7" ry="16" />
        <path d="M8 24h32" />
      </svg>
    );
  }
  if (/comput|informatic|coding|program/.test(n)) {
    return (
      <svg {...common}>
        <rect x="6" y="9" width="36" height="24" rx="3" />
        <path d="M18 41h12M24 33v8" />
      </svg>
    );
  }
  if (/english|literature/.test(n)) {
    return (
      <svg {...common}>
        <path d="M24 12c-4-3-10-4-16-4v28c6 0 12 1 16 4 4-3 10-4 16-4V8c-6 0-12 1-16 4zM24 12v28" />
      </svg>
    );
  }
  if (/hindi|sanskrit|punjabi|urdu|language/.test(n)) {
    return (
      <svg {...common}>
        <path d="M8 10h32v22H22l-8 7v-7H8z" />
        <path d="M15 18h18M15 24h11" />
      </svg>
    );
  }
  if (/scien/.test(n)) {
    return (
      <svg {...common}>
        <path d="M19 6h10M21 6v12L10 38a4 4 0 0 0 3.5 6h21A4 4 0 0 0 38 38L27 18V6" />
        <path d="M14 32h20" />
      </svg>
    );
  }
  // Default: a book
  return (
    <svg {...common}>
      <path d="M12 8h22a4 4 0 0 1 4 4v28H16a4 4 0 0 1-4-4zM12 36a4 4 0 0 1 4-4h22" />
    </svg>
  );
}
