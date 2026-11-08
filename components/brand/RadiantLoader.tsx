"use client";

import { useId, useMemo } from "react";
import { loader, LOADER_VIEWBOX } from "./brand-svg";

type RadiantLoaderProps = {
  /** Shown under the animation and announced to screen readers */
  label?: string;
  /** Version for dark backgrounds (lilac ring) */
  dark?: boolean;
  /** Width and height in px */
  size?: number;
  className?: string;
};

// Loading indicator: the paper plane circles the R/E bubbles.
// With reduced motion on, the brand kit slows it right down (6s) rather than stopping it,
// so it still reads as "busy".
export default function RadiantLoader({
  label = "Loading…",
  dark = false,
  size = 96,
  className = "",
}: RadiantLoaderProps) {
  const id = "rl" + useId().replace(/[^A-Za-z0-9_-]/g, "");
  const inner = useMemo(() => loader({ id, dark }), [id, dark]);

  return (
    <div role="status" className={`flex flex-col items-center gap-3 text-center ${className}`}>
      <svg
        viewBox={LOADER_VIEWBOX}
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        // Built only from the brand kit's constants (see brand-svg.ts), never from user input
        dangerouslySetInnerHTML={{ __html: inner }}
      />
      <span className="text-base font-bold">{label}</span>
    </div>
  );
}
