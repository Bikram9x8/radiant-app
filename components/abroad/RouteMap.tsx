import s from "./abroad.module.css";

// Hub illustration: a line-drawn globe with dashed routes from India to the study countries
// and a paper plane (bobs twice, then rests; still with reduced motion). From the design.
// The places are illustrative positions, not a real map projection.
// tone "dark" (default) is for the dark hub band; "light" is for a paper background (homepage).
const PLACES: { x: number; y: number; name: string }[] = [
  { x: 100, y: 95, name: "Canada" },
  { x: 118, y: 120, name: "USA" },
  { x: 220, y: 70, name: "UK" },
  { x: 238, y: 96, name: "Ireland" },
  { x: 262, y: 82, name: "Germany" },
  { x: 425, y: 250, name: "Australia" },
];
const INDIA = { x: 355, y: 158 };

export default function RouteMap({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <svg
      className={`${s.map}${light ? ` ${s.mapLight}` : ""} ${className}`}
      viewBox="0 0 520 330"
      role="img"
      aria-label="Routes from India to Canada, the USA, the UK, Ireland, Germany and Australia"
    >
      <g fill="none" stroke={light ? "#c9dedb" : "#1d4e55"} strokeWidth="1.5">
        <circle cx="260" cy="165" r="150" />
        <ellipse cx="260" cy="165" rx="150" ry="55" />
        <ellipse cx="260" cy="165" rx="150" ry="110" />
        <ellipse cx="260" cy="165" rx="55" ry="150" />
        <ellipse cx="260" cy="165" rx="110" ry="150" />
        <path d="M110 165h300M260 15v300" />
      </g>
      {PLACES.map((p) => (
        <g key={p.name}>
          <path
            className={s.route}
            d={`M${INDIA.x} ${INDIA.y} Q ${(INDIA.x + p.x) / 2} ${Math.min(INDIA.y, p.y) - 60} ${p.x} ${p.y}`}
          />
          <circle className={s.pinDot} cx={p.x} cy={p.y} r="6" />
          <text className={s.pinLabel} x={p.x + 10} y={p.y + 4}>
            {p.name}
          </text>
        </g>
      ))}
      <circle className={s.home} cx={INDIA.x} cy={INDIA.y} r="9" />
      <text className={s.homeLabel} x={INDIA.x + 13} y={INDIA.y + 5}>
        India
      </text>
      <g className={s.mapPlane}>
        <g transform="translate(300 60) rotate(-25)">
          <polygon points="20,0 -15,-12 -6,0" fill={light ? "#0f2e33" : "#fff"} />
          <polygon points="20,0 -6,0 -10,12" fill="#f97350" />
        </g>
      </g>
    </svg>
  );
}
