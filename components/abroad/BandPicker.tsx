"use client";

import { useState } from "react";
import s from "./abroad.module.css";

// "What does your band mean?": real buttons (keyboard and screen readers work by default),
// the chosen band is aria-pressed and its OFFICIAL descriptor is announced. No judgements of our own.
export default function BandPicker({ descriptors }: { descriptors: Record<string, string> }) {
  const bands = Object.keys(descriptors).sort((a, b) => Number(a) - Number(b));
  const [chosen, setChosen] = useState(bands.includes("7") ? "7" : bands[bands.length - 1]);

  return (
    <>
      <div className={s.bandRow} role="group" aria-label="Choose a band">
        {bands.map((b) => (
          <button
            key={b}
            type="button"
            aria-pressed={b === chosen}
            className={`${s.bandBtn} ${Number(b) <= Number(chosen) ? s.bandOn : ""}`}
            onClick={() => setChosen(b)}
          >
            {b}
          </button>
        ))}
      </div>
      <p className={s.bandInfo} aria-live="polite">
        Band {chosen}: {descriptors[chosen]}
      </p>
    </>
  );
}
