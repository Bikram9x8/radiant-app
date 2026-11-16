"use client";

import { useId, useMemo } from "react";
import { lockup } from "./brand-svg";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type RadiantLogoProps = {
  /** Version for dark backgrounds (white word, lilac trail, light cyan EDUCATIONS) */
  dark?: boolean;
  /** Show "EDUCATIONS" under the word */
  edu?: boolean;
  /** Plane flies, sparkles twinkle, i-plane hops. Still version when reduced motion is on. */
  animated?: boolean;
  /** With animated: the plane flies once (~2.4s) on page load, then rests in the still pose */
  once?: boolean;
  /** Smaller mark and bigger EDUCATIONS, for the header and footer */
  compact?: boolean;
  /** Set the size here: a height (e.g. "h-11") or a width (e.g. "w-full max-w-[150px]") */
  className?: string;
};

// Full Radiant Educations logo (mark + "Radiant" + optional EDUCATIONS), inline SVG.
// Screen readers hear "Radiant Educations" once; the drawing itself is hidden from them.
export default function RadiantLogo({
  dark = false,
  edu = true,
  animated = false,
  once = false,
  compact = false,
  className = "",
}: RadiantLogoProps) {
  const reduceMotion = usePrefersReducedMotion();
  // useId() can contain characters (« » :) that are not valid in CSS class names or url(#…)
  const id = "rlk" + useId().replace(/[^A-Za-z0-9_-]/g, "");
  const play = animated && !reduceMotion;
  const { viewBox, inner } = useMemo(
    () => lockup({ id, animated: play, once, dark, edu, compact }),
    [id, play, once, dark, edu, compact],
  );
  // Each option has its own viewBox; reserve the right shape before the SVG paints
  const [, , vw, vh] = viewBox.split(" ");

  return (
    <span
      role="img"
      aria-label="Radiant Educations"
      className={`inline-block shrink-0 ${className}`}
      style={{ aspectRatio: `${vw} / ${vh}` }}
    >
      <svg
        // A new <svg> element when animation switches on: SMIL timing (the plane's flight)
        // starts from when the element is created, so "once" plays in full after hydration
        key={play ? "animated" : "still"}
        viewBox={viewBox}
        aria-hidden="true"
        focusable="false"
        className="block h-full w-full overflow-visible"
        // Built only from the brand kit's constants (see brand-svg.ts), never from user input
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    </span>
  );
}
