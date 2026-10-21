"use client";

import Link from "next/link";
import { useState } from "react";

type Item = {
  id: string;
  href: string;
  name: string;
  label: string;
  color: string;
};

export default function ClassTiles({ items, visible }: { items: Item[]; visible: number }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, visible);
  const hiddenCount = items.length - visible;

  return (
    <>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shown.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${item.color}`}
          >
            <span className="block text-xs font-bold tracking-wider uppercase opacity-80">{item.label}</span>
            <span className="block mt-1.5 text-xl font-extrabold text-[#14142b]">{item.name}</span>
            <span className="block mt-3 text-sm font-bold">Open →</span>
          </Link>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-bold text-[#14142b] hover:bg-zinc-50"
        >
          {expanded ? "Show fewer classes" : `Show all ${items.length} classes`}
        </button>
      )}
    </>
  );
}