"use client";

import { useState } from "react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import s from "./landing.module.css";

const WORDS = [
  "B.Tech", "MBBS", "BCA", "JEE Main", "NEET UG", "Scholarships",
  "Internships", "BBA", "B.Com", "LLB", "B.Pharm", "Career test",
];

// Scrolling band of courses and exams. Decorative (hidden from screen readers), with a pause
// button; it also stops while hovered or focused, and stands still with reduced motion
// (the button is hidden then, see landing.module.css).
export default function Ticker() {
  const [paused, setPaused] = useState(false);
  // Two copies side by side, so the loop (translateX -50%) is seamless
  const items = [...WORDS, ...WORDS];

  return (
    <div className={`${s.ticker} ${paused ? s.paused : ""}`}>
      <div className={s.track} aria-hidden="true">
        {items.map((w, i) => (
          <span key={i} className="inline-flex items-center gap-[34px]">
            <span>{w}</span>
            <i>✦</i>
          </span>
        ))}
      </div>
      <button
        type="button"
        className={s.pauseBtn}
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        {/* A toggle keeps one name; aria-pressed says whether it's paused */}
        {paused ? (
          <IconPlayerPlayFilled size={14} aria-hidden="true" />
        ) : (
          <IconPlayerPauseFilled size={14} aria-hidden="true" />
        )}
        Pause<span className="sr-only"> scrolling course names</span>
      </button>
    </div>
  );
}
