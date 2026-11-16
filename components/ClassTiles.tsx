"use client";

import Link from "next/link";
import { useState } from "react";
import s from "@/components/school/school.module.css";

type Item = {
  id: string;
  href: string;
  name: string;
  label: string;
  color: string;
};

// Class tiles on /school. Sticker cards (press into their shadow); `color` is a background class.
// Used inside the School page wrapper, which provides the colour tokens and fonts.
export default function ClassTiles({ items, visible }: { items: Item[]; visible: number }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, visible);
  const hiddenCount = items.length - visible;

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-6">
        {shown.map((item) => (
          <Link key={item.id} href={item.href} className={`${s.press} [--radius:22px]`}>
            <span className={`${s.face} ${item.color} min-h-[132px] flex-col p-4 sm:p-5`}>
              <span className="block text-[13px] font-extrabold opacity-80">{item.label}</span>
              <span className={`${s.display} mt-1 block text-[22px] leading-tight font-bold break-words md:text-2xl`}>
                {item.name}
              </span>
              <span className="mt-auto block pt-3 text-sm font-extrabold">Open →</span>
            </span>
          </Link>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className={`${s.flat} mt-5 inline-flex min-h-12 items-center rounded-full border-[3px] border-(--hp-ink) bg-white px-6 text-[15px] font-extrabold text-(--hp-ink)`}
        >
          {expanded ? "Show fewer classes" : `Show all ${items.length} classes`}
        </button>
      )}
    </>
  );
}
