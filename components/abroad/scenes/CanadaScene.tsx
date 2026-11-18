import { Cloud, Plane, Water } from "./parts";

// Toronto: skyline, the dome and the CN Tower with its blinking light
const TOWERS: [number, number, number, number][] = [
  [10, 96, 22, 30],
  [34, 88, 18, 38],
  [54, 100, 20, 26],
  [78, 84, 16, 42],
  [172, 90, 20, 36],
  [196, 80, 18, 46],
  [216, 94, 24, 32],
  [244, 86, 16, 40],
  [262, 98, 30, 28],
];

export default function CanadaScene() {
  return (
    <>
      <rect width="300" height="150" fill="#ccfbf1" />
      <circle cx="262" cy="30" r="13" fill="#fed7aa" />
      <Cloud x={30} y={22} scale={1} />
      <Cloud x={180} y={34} scale={0.8} />
      <Plane />
      {TOWERS.map(([x, y, w, h]) => (
        <rect key={x} x={x} y={y} width={w} height={h} fill="#115e59" />
      ))}
      <path d="M100 126 a34 22 0 0 1 68 0z" fill="#e2e8ef" />
      <path d="M106 126 a28 16 0 0 1 56 0" fill="none" stroke="#99f6e4" strokeWidth="2" />
      <rect x="146" y="30" width="8" height="96" fill="#0f2e33" />
      <rect x="149" y="6" width="2" height="26" fill="#0f2e33" />
      <ellipse cx="150" cy="60" rx="13" ry="6" fill="#0f2e33" />
      <ellipse cx="150" cy="58" rx="10" ry="2" fill="#99f6e4" />
      <ellipse cx="150" cy="38" rx="5" ry="3" fill="#0f2e33" />
      <circle data-anim="blink" cx="150" cy="6" r="2.2" fill="#f97350" />
      <Water y={126} colour="#5eead4" />
    </>
  );
}
