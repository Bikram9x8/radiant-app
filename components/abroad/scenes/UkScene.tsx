import { Cloud, Plane, Water } from "./parts";

// London: Westminster, the clock tower, the London Eye (turns) and a red bus
const SPOKES = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  return { x: +(40 * Math.cos(a)).toFixed(1), y: +(40 * Math.sin(a)).toFixed(1) };
});
const BAYS = [86, 100, 114, 128, 142, 156];

export default function UkScene() {
  return (
    <>
      <rect width="300" height="150" fill="#fff4ec" />
      <circle cx="150" cy="26" r="12" fill="#fed7aa" />
      <Cloud x={110} y={18} scale={0.9} />
      <Cloud x={10} y={40} scale={0.7} />
      <Plane />
      <rect x="80" y="92" width="90" height="34" fill="#c2410c" opacity=".85" />
      {BAYS.map((x) => (
        <g key={x}>
          <rect x={x} y="84" width="4" height="10" fill="#c2410c" />
          <rect x={x + 1} y="100" width="3" height="12" fill="#fed7aa" />
        </g>
      ))}
      <rect x="58" y="44" width="22" height="82" fill="#9a3412" />
      <path d="M58 44l11-24 11 24z" fill="#0f2e33" />
      <rect x="68" y="10" width="2" height="12" fill="#0f2e33" />
      <circle cx="69" cy="58" r="7" fill="#fff4ec" stroke="#0f2e33" strokeWidth="1.5" />
      <path d="M69 58v-5M69 58l3 2" stroke="#0f2e33" strokeWidth="1.2" strokeLinecap="round" />
      <g transform="translate(232 76)">
        <g data-anim="spin">
          <circle r="40" fill="none" stroke="#0f2e33" strokeWidth="2.5" />
          {SPOKES.map((p) => (
            <g key={`${p.x}-${p.y}`}>
              <path d={`M0 0L${p.x} ${p.y}`} stroke="#94a3b8" strokeWidth="1" />
              <circle cx={p.x} cy={p.y} r="3" fill="#f97350" />
            </g>
          ))}
        </g>
      </g>
      <path d="M222 126l10-50 10 50" fill="none" stroke="#0f2e33" strokeWidth="3" />
      <Water y={126} colour="#99f6e4" />
      <g data-anim="move">
        <g transform="translate(110 112)">
          <rect width="26" height="14" rx="2" fill="#dc2626" />
          <rect x="2" y="2" width="22" height="4" fill="#fde2e2" />
          <circle cx="6" cy="14" r="2.5" fill="#0f2e33" />
          <circle cx="20" cy="14" r="2.5" fill="#0f2e33" />
        </g>
      </g>
    </>
  );
}
