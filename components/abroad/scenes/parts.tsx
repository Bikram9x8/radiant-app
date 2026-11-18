// Shared pieces of the landmark scenes (viewBox 0 0 300 150), from radiant-design/study-abroad.html.
// data-anim attributes are the animation hooks in components/abroad/abroad.module.css.

export function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g data-anim="cloud">
      <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#fff">
        <ellipse cx="20" cy="10" rx="20" ry="7" />
        <ellipse cx="13" cy="5" rx="9" ry="7" />
        <ellipse cx="27" cy="4" rx="10" ry="8" />
      </g>
    </g>
  );
}

const WAVES: [number, number, number][] = [
  [20, 8, 30],
  [90, 14, 22],
  [170, 6, 34],
  [240, 16, 26],
  [60, 22, 18],
  [200, 24, 20],
];

/** Water from height y down to the bottom, with small white wave lines */
export function Water({ y, colour }: { y: number; colour: string }) {
  return (
    <>
      <rect y={y} width="300" height={150 - y} fill={colour} />
      <g data-anim="wave" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".7">
        {WAVES.map(([x, dy, w]) => (
          <path key={`${x}-${dy}`} d={`M${x} ${y + dy}h${w}`} />
        ))}
      </g>
    </>
  );
}

/** The paper plane that flies in once */
export function Plane() {
  return (
    <g data-anim="plane">
      <g transform="translate(250 22) rotate(-12)">
        <polygon points="10,0 -8,-6 -3,0" fill="#fff" stroke="#0f2e33" strokeWidth=".8" />
        <polygon points="10,0 -3,0 -5,6" fill="#f97350" stroke="#0f2e33" strokeWidth=".8" />
      </g>
    </g>
  );
}
