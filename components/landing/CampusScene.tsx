import s from "./landing.module.css";
import ScenePlayer from "./ScenePlayer";

// Campus illustration under the hero, ported from the design's JavaScript generator to static SVG.
// Decorative only: hidden from screen readers. data-anim attributes are the animation hooks
// (landing.module.css): flag, twinkle and caps run briefly; clouds and the flying plane keep going
// and can be paused with the scene's own button (ScenePlayer). Still with reduced motion.

function Tree({ x, scale }: { x: number; scale: number }) {
  return (
    <g transform={`translate(${x} 252) scale(${scale})`}>
      <rect x="-4" y="-30" width="8" height="30" fill="#7c5a3a" />
      <circle cy="-52" r="30" fill="#0d9488" />
      <circle cx="-14" cy="-40" r="20" fill="#14b8a6" />
      <circle cx="12" cy="-62" r="16" fill="#2dd4bf" />
    </g>
  );
}

function Student({ x, colour, cap }: { x: number; colour: string; cap: boolean }) {
  return (
    <g transform={`translate(${x} 262)`}>
      <circle cy="-34" r="7" fill="#8a5a3b" />
      <path d="M-9 -24h18l3 26h-24z" fill={colour} />
      <rect x="-7" y="2" width="5" height="12" fill="#0f2e33" />
      <rect x="2" y="2" width="5" height="12" fill="#0f2e33" />
      {cap ? (
        <path d="M-11 -41l11-5 11 5-11 5z" fill="#0f2e33" />
      ) : (
        <rect x="7" y="-22" width="9" height="12" rx="2" fill="#f59e0b" />
      )}
    </g>
  );
}

function Cap({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g data-anim="cap" style={{ transformOrigin: `${x}px ${y}px` }}>
      <g transform={`translate(${x} ${y}) rotate(${r})`}>
        <path d="M-18 0l18-8 18 8-18 8z" fill="#0f2e33" />
        <path d="M-9 4v7q9 5 18 0v-7" fill="#1d4e55" />
        <path d="M14 2v12" stroke="#f97350" strokeWidth="2" />
        <circle cx="14" cy="15" r="2.5" fill="#f97350" />
      </g>
    </g>
  );
}

const CLOUDS = [
  { x: 120, y: 50, k: 1 },
  { x: 700, y: 95, k: 0.7 },
  { x: 380, y: 30, k: 0.85 },
];
const SKYLINE = [
  [20, 170, 70, 90],
  [110, 190, 60, 70],
  [960, 180, 80, 80],
  [1060, 150, 60, 110],
  [1130, 190, 70, 70],
];
const WINDOWS = Array.from({ length: 30 }, (_, i) => ({ r: Math.floor(i / 5), c: i % 5 }));

export default function CampusScene() {
  return (
    <ScenePlayer>
      <svg
        className={s.scene}
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="campus-dome" x1="0" x2="1">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset=".55" stopColor="#f97350" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
        </defs>

        {/* Sun and clouds */}
        <circle cx="1080" cy="70" r="34" fill="#fde68a" opacity=".8" />
        {CLOUDS.map((c, i) => (
          <g key={i} data-anim="cloud">
            <g transform={`translate(${c.x} ${c.y}) scale(${c.k})`} fill="#fff">
              <ellipse cx="40" cy="20" rx="40" ry="14" />
              <ellipse cx="28" cy="10" rx="18" ry="14" />
              <ellipse cx="54" cy="8" rx="20" ry="16" />
            </g>
          </g>
        ))}

        {/* Distant buildings, lawn and path */}
        <g fill="#ccfbf1">
          {SKYLINE.map(([x, y, w, h]) => (
            <rect key={x} x={x} y={y} width={w} height={h} />
          ))}
        </g>
        <rect y="248" width="1200" height="52" fill="#cdeee0" />
        <path d="M560 300l30-52h20l30 52z" fill="#f4ecdc" />

        {/* Library */}
        <rect x="80" y="182" width="190" height="66" fill="#f8fafc" />
        <rect x="80" y="182" width="190" height="66" fill="none" stroke="#cbd5e1" />
        <path d="M70 184h210l-20-22H90z" fill="#115e59" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${98 + i * 32} 236v-30a10 10 0 0 1 20 0v30z`} fill="#99f6e4" />
        ))}

        {/* Clock tower */}
        <rect x="302" y="78" width="56" height="170" fill="#f1f5f9" />
        <rect x="340" y="78" width="18" height="170" fill="#dfe7ef" />
        <path d="M296 80h68l-34-48z" fill="#0f2e33" />
        <circle cx="330" cy="112" r="17" fill="#fff" stroke="#0f2e33" strokeWidth="3" />
        <path d="M330 112v-10M330 112l8 4" stroke="#0f2e33" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="316" y="150" width="28" height="40" rx="14" fill="#99f6e4" />

        {/* Main hall with columns and dome */}
        <rect x="460" y="238" width="280" height="12" fill="#e2e8f0" />
        <rect x="466" y="140" width="268" height="12" fill="#f1f5f9" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <rect x={478 + i * 32} y="150" width="12" height="88" fill="#fff" />
            <rect x={486 + i * 32} y="150" width="4" height="88" fill="#e2e8f0" />
          </g>
        ))}
        <path d="M456 142h288l-144-46z" fill="#0f2e33" />
        <path d="M500 132h200l-100-30z" fill="#1d4e55" />
        <rect x="560" y="70" width="80" height="28" fill="#f1f5f9" />
        <path d="M552 72a48 48 0 0 1 96 0z" fill="url(#campus-dome)" />
        <path d="M572 58a30 30 0 0 1 22-20" stroke="#fff" strokeWidth="4" fill="none" opacity=".6" strokeLinecap="round" />
        <rect x="598" y="10" width="3" height="16" fill="#0f2e33" />
        <path data-anim="flag" d="M601 10h18l-5 6 5 6h-18z" fill="#f97350" />

        {/* Hostel block with lit windows */}
        <rect x="830" y="104" width="170" height="144" fill="#0f2e33" />
        <rect x="980" y="104" width="20" height="144" fill="#1d4e55" />
        {WINDOWS.map(({ r, c }) => (
          <rect
            key={`${r}-${c}`}
            x={842 + c * 30}
            y={118 + r * 22}
            width="22"
            height="14"
            rx="2"
            fill={(r + c) % 3 ? "#ffedd5" : "#fdba74"}
            data-anim={(r * 5 + c) % 7 === 0 ? "twinkle" : undefined}
          />
        ))}
        <rect x="896" y="226" width="40" height="22" fill="#fdba74" />

        <Tree x={40} scale={1} />
        <Tree x={290} scale={0.8} />
        <Tree x={430} scale={1.1} />
        <Tree x={780} scale={1.15} />
        <Tree x={1030} scale={0.95} />
        <Tree x={1160} scale={1.2} />

        <Student x={520} colour="#0f766e" cap />
        <Student x={548} colour="#f97350" cap={false} />
        <Student x={672} colour="#0f2e33" cap />
        <Student x={700} colour="#0f766e" cap={false} />
        <Student x={380} colour="#c2410c" cap={false} />
        <Student x={880} colour="#f97350" cap />

        {/* Thrown graduation caps */}
        <Cap x={560} y={180} r={-14} />
        <Cap x={690} y={160} r={10} />
        <Cap x={470} y={60} r={-6} />
        <Cap x={760} y={40} r={12} />

        {/* Paper plane and its dotted trail. It rests here until ScenePlayer starts the flight
            (begin="indefinite"), so it never moves with reduced motion. The flight path is the
            design's path shifted by the resting point (400, 74). */}
        <path d="M120 90q120-50 230-10" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 7" fill="none" />
        <g transform="translate(400 74)">
          <g>
            <animateMotion
              begin="indefinite"
              dur="14s"
              repeatCount="indefinite"
              rotate="auto"
              path="M-460 46 C -200 -54, 20 86, 240 -4 S 600 -34, 880 36"
            />
            <g transform="rotate(-12)">
              <polygon points="24,0 -18,-14 -7,0" fill="#fff" stroke="#0f2e33" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="24,0 -7,0 -12,14" fill="#f97350" stroke="#0f2e33" strokeWidth="2" strokeLinejoin="round" />
            </g>
          </g>
        </g>
      </svg>
    </ScenePlayer>
  );
}
