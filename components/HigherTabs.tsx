"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconBuildingSkyscraper,
  IconAward,
  IconBriefcase,
  IconUserCheck,
  IconClipboardCheck,
  IconSchool,
} from "@tabler/icons-react";

type Card = { id: string; name: string; slug: string };
type Stage = { id: string; name: string; slug: string; cards: Card[] };

const ICONS: Record<string, any> = {
  "colleges-courses": IconBuildingSkyscraper,
  scholarships: IconAward,
  internships: IconBriefcase,
  "jobs-careers": IconUserCheck,
  "exams-preparation": IconClipboardCheck,
};

const DESCRIPTIONS: Record<string, string> = {
  "colleges-courses": "Find top colleges, compare courses and plan your admission.",
  scholarships: "Government and private scholarships, with dates and how to apply.",
  internships: "Internships by field, company and season.",
  "jobs-careers": "Fresher jobs, campus placements and career paths.",
  "exams-preparation": "Entrance exams, mock tests and previous year papers.",
};

const COLORS = ["pastel-purple", "pastel-yellow", "pastel-mint", "pastel-peach", "pastel-blue"];

export default function HigherTabs({ rootSlug, stages }: { rootSlug: string; stages: Stage[] }) {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  if (!stage) return null;

  return (
    <div>
      {/* Stage tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose your stage">
        {stages.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors duration-300 min-h-[44px] ${
              i === active
                ? "bg-[#5b33d6] text-white shadow-md"
                : "bg-zinc-100 text-zinc-700 hover:bg-violet-100 hover:text-[#5b33d6]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Cards for the selected stage: fade between stages */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {stage.cards.map((card, i) => {
            const Icon = ICONS[card.slug] ?? IconSchool;
            return (
              <Link
                key={card.id}
                href={`/courses/${rootSlug}/${stage.slug}/${card.slug}`}
                className={`card-lift block p-6 ${COLORS[i % COLORS.length]}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center">
                  <Icon size={30} stroke={2} />
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-[#14142b] break-words">{card.name}</h3>
                <p className="mt-2 text-sm text-zinc-700">
                  {DESCRIPTIONS[card.slug] ?? "Explore this section."}
                </p>
                <span className="btn btn-primary mt-5" style={{ padding: "0.55rem 1.2rem" }}>
                  Open →
                </span>
              </Link>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}