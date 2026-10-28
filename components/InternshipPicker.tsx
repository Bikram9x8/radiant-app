"use client";

import { useState } from "react";
import type { InternshipLevelOption } from "@/lib/internships";

export default function InternshipPicker({
  options,
  value,
  onChange,
  inputClass,
  labelClass,
}: {
  options: InternshipLevelOption[];
  // The chosen internship subcategory id (or null)
  value: string | null;
  onChange: (courseNodeId: string | null) => void;
  inputClass: string;
  labelClass: string;
}) {
  const [levelId, setLevelId] = useState(
    () => options.find((l) => l.subcategories.some((s) => s.id === value))?.id ?? ""
  );
  const level = options.find((l) => l.id === levelId);

  return (
    <div className="rounded-xl border border-zinc-200 p-4 flex flex-col gap-4">
      <p className="text-sm font-semibold text-zinc-900">
        Where should this internship appear?{" "}
        <span className="font-normal text-zinc-500">(Level, Internship category)</span>
      </p>
      <div>
        <label className={labelClass}>Level</label>
        <select
          value={levelId}
          onChange={(e) => {
            setLevelId(e.target.value);
            onChange(null);
          }}
          className={inputClass}
        >
          <option value="">Select</option>
          {options.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      {level && (
        <div>
          <label className={labelClass}>Internship category</label>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            className={inputClass}
          >
            <option value="">Select</option>
            {level.subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 mt-1">
            It will be listed under this category for all three levels.
          </p>
        </div>
      )}
    </div>
  );
}
