import { Cloud, Plane, Water } from "./parts";

// Dublin: Georgian houses with coloured doors, the Spire and the Ha'penny Bridge
const DOORS = ["#c2410c", "#0f766e", "#f59e0b", "#0f2e33", "#f97350", "#115e59"];
const BRIDGE_POSTS = Array.from({ length: 7 }, (_, i) => {
  const x = 130 + i * 14;
  return { x, y: +(128 - 28 * Math.sin((Math.PI * (x - 120)) / 110) * 1.1).toFixed(1) };
});

export default function IrelandScene() {
  return (
    <>
      <rect width="300" height="150" fill="#e0f2f1" />
      <circle cx="200" cy="30" r="12" fill="#fed7aa" />
      <Cloud x={40} y={24} scale={0.9} />
      <Cloud x={160} y={40} scale={0.6} />
      <Plane />
      <path d="M0 96 Q 60 70 130 92 T 300 88 V126 H0z" fill="#86efac" opacity=".6" />
      {DOORS.map((door, i) => (
        <g key={i}>
          <rect x={8 + i * 30} y="72" width="28" height="54" fill="#d6b49a" />
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={12 + i * 30} y={78 + r * 14} width="6" height="8" fill="#fff" />
              <rect x={22 + i * 30} y={78 + r * 14} width="6" height="8" fill="#fff" />
            </g>
          ))}
          <path d={`M${16 + i * 30} 126v-12a6 6 0 0 1 12 0v12z`} fill={door} />
        </g>
      ))}
      <rect x="238" y="4" width="2" height="122" fill="#94a3b8" />
      <Water y={126} colour="#5eead4" />
      <path d="M120 128 Q 175 96 230 128" fill="none" stroke="#fff" strokeWidth="4" />
      <path d="M120 128 Q 175 104 230 128" fill="none" stroke="#fff" strokeWidth="1.5" />
      {BRIDGE_POSTS.map((p) => (
        <path key={p.x} d={`M${p.x} ${p.y}v6`} stroke="#fff" strokeWidth="1" />
      ))}
      <path d="M118 129h114" stroke="#fff" strokeWidth="2" />
    </>
  );
}
