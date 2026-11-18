import { Cloud, Plane, Water } from "./parts";

// New York: skyline, a tall spire, the Statue of Liberty (flickering torch) and a ferry
const TOWERS: [number, number, number, number][] = [
  [150, 70, 18, 56],
  [170, 58, 16, 68],
  [188, 76, 20, 50],
  [232, 66, 18, 60],
  [252, 82, 22, 44],
  [276, 72, 24, 54],
];
const CROWN = [-60, -30, 0, 30, 60].map((a) => ({
  x: +(8 * Math.sin((a * Math.PI) / 180)).toFixed(1),
  y: +(-8 * Math.cos((a * Math.PI) / 180)).toFixed(1),
}));

export default function UsaScene() {
  return (
    <>
      <rect width="300" height="150" fill="#e0f2f1" />
      <circle cx="120" cy="26" r="12" fill="#fed7aa" />
      <Cloud x={150} y={20} scale={0.9} />
      <Cloud x={10} y={30} scale={0.6} />
      <Plane />
      {TOWERS.map(([x, y, w, h]) => (
        <rect key={x} x={x} y={y} width={w} height={h} fill="#0f2e33" />
      ))}
      <path d="M210 126V60h4V44h2V30h1V12h1v18h1v14h2v16h4v66z" fill="#115e59" />
      <rect x="40" y="106" width="44" height="20" fill="#94a3b8" />
      <rect x="48" y="94" width="28" height="12" fill="#cbd5e1" />
      <path d="M54 94c0-20 2-34 8-40 6 6 8 20 8 40z" fill="#14b8a6" />
      <circle cx="62" cy="48" r="5" fill="#14b8a6" />
      {CROWN.map((p) => (
        <path key={`${p.x}-${p.y}`} d={`M62 48l${p.x} ${p.y}`} stroke="#14b8a6" strokeWidth="1.6" />
      ))}
      <path d="M66 56l8-26" stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" />
      <rect x="71" y="24" width="6" height="5" fill="#14b8a6" />
      <path data-anim="flame" d="M74 24c-3-3-2-7 0-10 2 3 3 7 0 10z" fill="#f97350" />
      <Water y={126} colour="#5eead4" />
      <g data-anim="move">
        <g transform="translate(110 122)">
          <path d="M0 0h26l-4 6H4z" fill="#fff" />
          <rect x="8" y="-6" width="10" height="6" fill="#f97350" />
        </g>
      </g>
    </>
  );
}
