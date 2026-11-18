import { Cloud, Plane, Water } from "./parts";

// Sydney: the Harbour Bridge (arch with hangers), the Opera House sails and a sailing boat
const HANGERS = Array.from({ length: 11 }, (_, i) => {
  const x = 158 + i * 13;
  const t = (x - 150) / 146;
  const top = (1 - t) * (1 - t) * 126 + 2 * (1 - t) * t * 40 + t * t * 126;
  const bottom = (1 - t) * (1 - t) * 126 + 2 * (1 - t) * t * 56 + t * t * 126;
  return { x, top: +top.toFixed(1), bottom: +bottom.toFixed(1) };
});
const SAILS: [number, number, number, number][] = [
  [30, 112, 26, 62],
  [52, 112, 30, 56],
  [78, 112, 28, 70],
  [100, 112, 24, 82],
];

export default function AustraliaScene() {
  return (
    <>
      <rect width="300" height="150" fill="#ccfbf1" />
      <circle cx="40" cy="28" r="13" fill="#fed7aa" />
      <Cloud x={90} y={20} scale={0.8} />
      <Cloud x={200} y={40} scale={0.6} />
      <Plane />
      <path d="M150 126 Q 222 40 296 126" fill="none" stroke="#0f2e33" strokeWidth="4" />
      <path d="M150 126 Q 222 56 296 126" fill="none" stroke="#0f2e33" strokeWidth="2" />
      {HANGERS.map((h) => (
        <path key={h.x} d={`M${h.x} ${h.top}V${h.bottom}`} stroke="#0f2e33" strokeWidth="1" />
      ))}
      <rect x="146" y="96" width="10" height="30" fill="#94a3b8" />
      <rect x="290" y="96" width="10" height="30" fill="#94a3b8" />
      <rect x="150" y="104" width="150" height="3" fill="#0f2e33" />
      <rect x="18" y="112" width="120" height="14" fill="#fed7aa" />
      {SAILS.map(([x, y, h, w]) => (
        <path
          key={x}
          d={`M${x} ${y}Q${x + 4} ${y - h - 6} ${x + w / 3} ${y - h}Q${x + w / 3 + 10} ${y - h / 2} ${x + w / 2 + 6} ${y}z`}
          fill="#fff"
          stroke="#cbd5e1"
        />
      ))}
      <Water y={126} colour="#5eead4" />
      <g data-anim="move">
        <g transform="translate(60 122)">
          <path d="M0 0h20l-3 5H3z" fill="#0f2e33" />
          <path d="M10 0V-16l9 14z" fill="#fff" stroke="#0f2e33" strokeWidth=".8" />
        </g>
      </g>
    </>
  );
}
