"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconBuildingSkyscraper,
  IconAward,
  IconBriefcase,
  IconUserCheck,
  IconClipboardCheck,
  IconSchool,
} from "@tabler/icons-react";
import s from "@/components/school/school.module.css";

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

// Option B pastels (backgrounds only; text stays ink for contrast)
const COLORS = ["bg-(--hp-lavender)", "bg-(--hp-yellow)", "bg-(--hp-mint)", "bg-(--hp-coral)", "bg-(--hp-sky)"];

// Stage tabs (After 12th, After Graduation...) and the section cards for the chosen stage.
// Used inside the /higher page wrapper, which provides the colour tokens and fonts.
export default function HigherTabs({ rootSlug, stages }: { rootSlug: string; stages: Stage[] }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const stage = stages[active];

  if (!stage) return null;

  return (
    <div>
      {/* Stage tabs */}
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
        role="tablist"
        aria-label="Choose your stage"
      >
        {stages.map((st, i) => (
          <button
            key={st.id}
            id={`${baseId}-tab-${i}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel`}
            onClick={() => setActive(i)}
            className={`${s.flat} min-h-11 shrink-0 rounded-full px-5 text-[15px] font-extrabold whitespace-nowrap ${
              i === active
                ? "border-[3px] border-(--hp-ink) bg-(--hp-ink) text-white"
                : "border-2 border-(--hp-ink) bg-white text-(--hp-ink) hover:bg-(--hp-butter)"
            }`}
          >
            {st.name}
          </button>
        ))}
      </div>

      {/* Cards for the selected stage: a quick fade between stages (none with reduced motion) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stage.id}
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
          className="mt-6 grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          {stage.cards.map((card, i) => {
            const Icon = ICONS[card.slug] ?? IconSchool;
            return (
              <Link
                key={card.id}
                href={`/courses/${rootSlug}/${stage.slug}/${card.slug}`}
                className={`${s.press} [--radius:26px]`}
              >
                <span className={`${s.face} ${COLORS[i % COLORS.length]} flex-col p-6`}>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-(--hp-ink) bg-white">
                    <Icon size={30} stroke={2} aria-hidden="true" />
                  </span>
                  <span className={`${s.display} mt-5 block text-2xl leading-tight font-bold break-words`}>{card.name}</span>
                  <span className="mt-2 block text-[15px] leading-relaxed font-semibold">
                    {DESCRIPTIONS[card.slug] ?? "Explore this section."}
                  </span>
                  <span className="mt-5 inline-flex h-11 items-center self-start rounded-full bg-(--hp-ink) px-5 font-extrabold text-white">
                    Open →
                  </span>
                </span>
              </Link>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
