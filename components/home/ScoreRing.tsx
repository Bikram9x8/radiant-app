"use client";

import { useRef } from "react";
import s from "./home.module.css";
import { useEnterOnScroll } from "./useEnterOnScroll";

// Decorative example score (not real data). Fills from 0 to 82% when scrolled into view.
// pathLength=100 makes the dash maths simple: offset 18 = 82% drawn, offset 100 = empty.
export default function ScoreRing({ className = "" }: { className?: string }) {
  const arcRef = useRef<SVGCircleElement>(null);
  useEnterOnScroll(arcRef, "ring", "empty", "full");

  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--hp-lavender-soft)" strokeWidth="24" />
      <circle
        ref={arcRef}
        className={s.ringArc}
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="var(--hp-purple)"
        strokeWidth="24"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="18"
        transform="rotate(-90 100 100)"
      />
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fontSize="44"
        fontWeight="700"
        fill="var(--hp-ink)"
        style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
      >
        82%
      </text>
    </svg>
  );
}
