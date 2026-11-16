"use client";

import { useId, useMemo } from "react";
import { loader, LOADER_VIEWBOX } from "./brand-svg";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

type RadiantLoaderProps = {
  /** Shown under the animation and announced to screen readers */
  label?: string;
  /** Version for dark backgrounds (light label text) */
  dark?: boolean;
  /** Width and height in px */
  size?: number;
  className?: string;
};

// Loading indicator: the teal and coral circles gently drift apart and back together.
// With reduced motion on, the mark stays still and the label says it is loading.
export default function RadiantLoader({
  label = "Loading…",
  dark = false,
  size = 96,
  className = "",
}: RadiantLoaderProps) {
  const id = "rl" + useId().replace(/[^A-Za-z0-9_-]/g, "");
  const reduceMotion = usePrefersReducedMotion();
  const inner = useMemo(() => loader({ id, animated: !reduceMotion }), [id, reduceMotion]);

  return (
    <div
      role="status"
      className={`flex flex-col items-center gap-3 text-center ${dark ? "text-white" : "text-ink"} ${className}`}
    >
      <svg
        // New element when animation switches on, so the SMIL timing starts fresh
        key={reduceMotion ? "still" : "animated"}
        viewBox={LOADER_VIEWBOX}
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        // Built only from the brand constants (see brand-svg.ts), never from user input
        dangerouslySetInnerHTML={{ __html: inner }}
      />
      <span className="text-base font-bold">{label}</span>
    </div>
  );
}
