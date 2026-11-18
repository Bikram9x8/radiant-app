"use client";

import { useId, useMemo, useState } from "react";
import type { Level, Scholarship } from "@/lib/abroad/types";
import ScholarshipCard from "./ScholarshipCard";
import s from "./abroad.module.css";

const LEVELS: Level[] = ["Bachelors", "Masters", "PhD"];

// Scholarships with country and level filters. Only verified items are passed in by the page.
// The result count is announced to screen readers when a filter changes.
export default function ScholarshipList({
  items,
  countries,
}: {
  items: Scholarship[];
  /** Filter options: slug -> display name (only countries that have at least one scholarship) */
  countries: { slug: string; name: string }[];
}) {
  const id = useId();
  const [country, setCountry] = useState("all");
  const [level, setLevel] = useState<"all" | Level>("all");

  const shown = useMemo(
    () =>
      items.filter(
        (it) => (country === "all" || it.countries.includes(country)) && (level === "all" || it.levels.includes(level)),
      ),
    [items, country, level],
  );

  return (
    <>
      <div className={s.toolbar}>
        <div className={s.toolField}>
          <label htmlFor={`${id}-c`}>Country</label>
          <select id={`${id}-c`} value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="all">All countries</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className={s.toolField}>
          <label htmlFor={`${id}-l`}>Level</label>
          <select id={`${id}-l`} value={level} onChange={(e) => setLevel(e.target.value as "all" | Level)}>
            <option value="all">Any level</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <p className={s.count} aria-live="polite">
          {shown.length} {shown.length === 1 ? "scholarship" : "scholarships"}
        </p>
      </div>

      {shown.length > 0 ? (
        <div className={s.slist}>
          {shown.map((it) => (
            <ScholarshipCard key={it.slug} item={it} />
          ))}
        </div>
      ) : (
        <div className={s.soonCard}>
          <p>No scholarships match. Try another country or level.</p>
        </div>
      )}
    </>
  );
}
