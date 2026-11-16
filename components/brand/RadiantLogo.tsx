import { lockup } from "./brand-svg";

type RadiantLogoProps = {
  /** Version for dark backgrounds (white RADIANT, light-orange EDUCATIONS) */
  dark?: boolean;
  /** Show "EDUCATIONS" under RADIANT */
  edu?: boolean;
  /** Kept for the old API; the design logo is still (motion lives in RadiantLoader) */
  animated?: boolean;
  /** Kept for the old API; no effect */
  once?: boolean;
  /** Kept for the old API; no effect (the design logo has one layout) */
  compact?: boolean;
  /** Set the size here: a height (e.g. "h-11") or a width (e.g. "w-full max-w-[150px]") */
  className?: string;
};

// Full Radiant Educations logo (mark + RADIANT + optional EDUCATIONS), inline SVG.
// Screen readers hear "Radiant Educations" once; the drawing itself is hidden from them.
export default function RadiantLogo({ dark = false, edu = true, className = "" }: RadiantLogoProps) {
  const { viewBox, inner } = lockup({ dark, edu });
  // Reserve the right shape before the SVG paints
  const [, , vw, vh] = viewBox.split(" ");

  return (
    <span
      role="img"
      aria-label="Radiant Educations"
      className={`inline-block shrink-0 ${className}`}
      style={{ aspectRatio: `${vw} / ${vh}` }}
    >
      <svg
        viewBox={viewBox}
        aria-hidden="true"
        focusable="false"
        className="block h-full w-full overflow-visible"
        // Built only from the brand constants (see brand-svg.ts), never from user input
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    </span>
  );
}
