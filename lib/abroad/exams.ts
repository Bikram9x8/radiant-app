import type { Exam } from "./types";

// Study-abroad exams (IELTS first). Facts come from the exam's official site, each with its URL and
// the date checked. Draft items never render. Keep imports relative (used by the data check script).

const CHECKED = "2026-11-18";
const IELTS = "IELTS (ielts.org)";
const IELTS_TEST = "https://ielts.org/take-a-test/test-types/ielts-academic-test";
const IELTS_SCORING = "https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail";

export const EXAMS: Exam[] = [
  {
    slug: "ielts",
    name: "IELTS",
    subtitle: "Academic",
    status: "verified",
    purpose: "English test for study abroad",
    scoreScale: {
      value: "Bands 1–9, in whole and half bands",
      sourceUrl: IELTS_SCORING,
      sourceName: IELTS,
      lastChecked: CHECKED,
    },
    duration: {
      value: "2 hours 45 minutes",
      sourceUrl: IELTS_TEST,
      sourceName: IELTS,
      lastChecked: CHECKED,
    },
    format: {
      value: [
        { part: "Listening", detail: "4 parts, 40 questions", time: "About 30 min" },
        { part: "Reading", detail: "3 sections, 40 questions", time: "60 min" },
        { part: "Writing", detail: "2 tasks (150 and 250 words)", time: "60 min" },
        { part: "Speaking", detail: "3 parts, face to face", time: "11–14 min" },
      ],
      sourceUrl: `${IELTS_TEST}/ielts-academic-format-listening`,
      sourceName: IELTS,
      lastChecked: CHECKED,
      note: "From the four ielts.org format pages (listening, reading, writing, speaking).",
    },
    validity: {
      value: "IELTS recommends treating results as valid for two years",
      sourceUrl: IELTS_SCORING,
      sourceName: IELTS,
      lastChecked: CHECKED,
      note: "Each university or visa body decides what it accepts.",
    },
    descriptors: {
      value: {
        "1": "Non-user: no ability to use the language except a few isolated words",
        "2": "Intermittent user: great difficulty understanding spoken and written English",
        "3": "Extremely limited user: understands only general meaning in very familiar situations",
        "4": "Limited user: basic competence is limited to familiar situations",
        "5": "Modest user: partial command of the language",
        "6": "Competent user: effective command despite some inaccuracies",
        "7": "Good user: operational command, with occasional inaccuracies",
        "8": "Very good user",
        "9": "Expert user: fully operational command of the language",
      },
      sourceUrl: IELTS_SCORING,
      sourceName: IELTS,
      lastChecked: CHECKED,
      note: "Shortened from the official band descriptions.",
    },
    faqs: [],
  },
];
