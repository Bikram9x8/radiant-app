import type { FlagCode } from "@/lib/abroad/types";
import s from "./abroad.module.css";

// Simple flag drawings (approximate proportions), from radiant-design/study-abroad.html.
// Decorative: the country name is always in the text next to it.

const US_STRIPES = Array.from({ length: 7 }, (_, i) => i * (20 / 6.5));
const US_STARS = Array.from({ length: 12 }, (_, i) => ({ cx: 2 + (i % 4) * 3, cy: 2 + Math.floor(i / 4) * 3.3 }));
const EU_STARS = Array.from({ length: 12 }, (_, i) => ({
  cx: 15 + 6 * Math.cos((i * Math.PI) / 6),
  cy: 10 + 6 * Math.sin((i * Math.PI) / 6),
}));
const SOUTHERN_CROSS: [number, number][] = [
  [23, 5],
  [20, 10],
  [26, 9],
  [23, 16],
];

function UnionCanton() {
  return (
    <>
      <path d="M0 0l15 10M15 0L0 10" stroke="#fff" strokeWidth="2" />
      <path d="M7.5 0v10M0 5h15" stroke="#fff" strokeWidth="3" />
      <path d="M7.5 0v10M0 5h15" stroke="#c8102e" strokeWidth="1.6" />
    </>
  );
}

const FLAGS: Record<FlagCode, React.ReactNode> = {
  ca: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <rect width="7.5" height="20" fill="#d52b1e" />
      <rect x="22.5" width="7.5" height="20" fill="#d52b1e" />
      <path
        d="M15 4l1.3 2.6 2-.6-.7 3 1.9-.9-.4 2.3 1.5.6-3.3 2.1.3 1.7h-5.2l.3-1.7-3.3-2.1 1.5-.6-.4-2.3 1.9.9-.7-3 2 .6z"
        fill="#d52b1e"
      />
    </>
  ),
  uk: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" strokeWidth="1.6" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.4" />
    </>
  ),
  us: (
    <>
      <rect width="30" height="20" fill="#fff" />
      {US_STRIPES.map((y) => (
        <rect key={y} y={y} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="13" height="10.8" fill="#3c3b6e" />
      {US_STARS.map((st) => (
        <circle key={`${st.cx}-${st.cy}`} cx={st.cx} cy={st.cy} r=".7" fill="#fff" />
      ))}
    </>
  ),
  au: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <UnionCanton />
      <circle cx="7.5" cy="15" r="2" fill="#fff" />
      {SOUTHERN_CROSS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={cy === 16 ? 1.1 : 1} fill="#fff" />
      ))}
    </>
  ),
  de: (
    <>
      <rect width="30" height="6.7" fill="#000" />
      <rect y="6.7" width="30" height="6.7" fill="#dd0000" />
      <rect y="13.4" width="30" height="6.6" fill="#ffce00" />
    </>
  ),
  ie: (
    <>
      <rect width="10" height="20" fill="#169b62" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ff883e" />
    </>
  ),
  nz: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <UnionCanton />
      {SOUTHERN_CROSS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.2" fill="#c8102e" stroke="#fff" strokeWidth=".5" />
      ))}
    </>
  ),
  eu: (
    <>
      <rect width="30" height="20" fill="#003399" />
      {EU_STARS.map((st, i) => (
        <circle key={i} cx={st.cx} cy={st.cy} r=".9" fill="#ffcc00" />
      ))}
    </>
  ),
};

export default function Flag({ code, className = "" }: { code: FlagCode; className?: string }) {
  return (
    <svg className={`${s.flag} ${className}`} viewBox="0 0 30 20" aria-hidden="true" focusable="false">
      {FLAGS[code]}
    </svg>
  );
}
