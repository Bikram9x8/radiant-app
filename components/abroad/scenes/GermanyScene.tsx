import { Cloud, Plane } from "./parts";

// Berlin: the Brandenburg Gate and the TV tower with its blinking light
const COLUMNS = [0, 1, 2, 3, 4, 5].map((i) => 92 + i * 14);

export default function GermanyScene() {
  return (
    <>
      <rect width="300" height="150" fill="#fff4ec" />
      <circle cx="70" cy="30" r="12" fill="#fed7aa" />
      <Cloud x={120} y={18} scale={0.9} />
      <Cloud x={20} y={46} scale={0.6} />
      <Plane />
      <rect x="0" y="100" width="300" height="26" fill="#e2e8ef" />
      <rect x="86" y="84" width="88" height="42" fill="#fed7aa" />
      <rect x="86" y="74" width="88" height="10" fill="#c2410c" />
      <rect x="82" y="70" width="96" height="5" fill="#9a3412" />
      <rect x="118" y="58" width="24" height="12" fill="#9a3412" />
      <path d="M122 58l4-8h8l4 8z" fill="#115e59" />
      {COLUMNS.map((x) => (
        <rect key={x} x={x} y="84" width="7" height="42" fill="#b45309" />
      ))}
      <rect x="232" y="44" width="5" height="82" fill="#0f2e33" />
      <circle cx="234.5" cy="54" r="10" fill="#0f2e33" />
      <rect x="226" y="52" width="17" height="3" fill="#99f6e4" />
      <rect x="233.5" y="8" width="2" height="36" fill="#0f2e33" />
      <circle data-anim="blink" cx="234.5" cy="8" r="2.2" fill="#f97350" />
      <rect y="126" width="300" height="24" fill="#cdeee0" />
    </>
  );
}
