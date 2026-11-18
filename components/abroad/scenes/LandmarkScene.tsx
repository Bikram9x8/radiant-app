import type { SceneCode } from "@/lib/abroad/types";
import s from "../abroad.module.css";
import CanadaScene from "./CanadaScene";
import UkScene from "./UkScene";
import UsaScene from "./UsaScene";
import AustraliaScene from "./AustraliaScene";
import GermanyScene from "./GermanyScene";
import IrelandScene from "./IrelandScene";

const SCENES: Record<SceneCode, () => React.ReactElement> = {
  ca: CanadaScene,
  uk: UkScene,
  us: UsaScene,
  au: AustraliaScene,
  de: GermanyScene,
  ie: IrelandScene,
};

// A country's landmark scene (viewBox 0 0 300 150, fills and crops to its box).
// Decorative: hidden from screen readers, the country name is always in the text.
// Plays once on load; more motion while the parent with class `sceneHost` is hovered
// (import it from abroad.module.css); still with reduced motion.
export default function LandmarkScene({ code, className = "" }: { code: SceneCode; className?: string }) {
  const Scene = SCENES[code];
  return (
    <svg
      className={`${s.scene} ${className}`}
      viewBox="0 0 300 150"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <Scene />
    </svg>
  );
}
