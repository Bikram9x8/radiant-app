// MCQ constants that are safe to use in client components (no prisma, no secrets).
// lib/mcq.ts re-exports these for server code.

// Courses whose chapters can have MCQ tests
export const MCQ_COURSE_SLUGS = ["cbse", "icse", "competitive"];
export const MCQ_OPTIONS = ["A", "B", "C", "D"] as const;
export type McqOptionKey = (typeof MCQ_OPTIONS)[number];

export const QUESTION_LIMITS = { text: 2000, option: 500, explanation: 3000 };
export const QUESTION_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

// Time-limit form field: "" = untimed, otherwise whole minutes 1-300
export function parseTimeLimit(value: string): number | null | "invalid" {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 300 ? n : "invalid";
}

export type McqChapter = {
  id: string;
  name: string;
  chapterNo: number | null;
  // Ancestors from the course down to the chapter's parent (e.g. CBSE > Class 10 > Mathematics)
  trail: { id: string; name: string; slug: string; kind: string }[];
};

// e.g. "CBSE › Class 11 › Mathematics › Ch 9. Straight Lines"
export function chapterLabel(chapter: McqChapter): string {
  const name = chapter.chapterNo ? `Ch ${chapter.chapterNo}. ${chapter.name}` : chapter.name;
  return [...chapter.trail.map((n) => n.name), name].join(" › ");
}
