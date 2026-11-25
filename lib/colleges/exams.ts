// Entrance exams: URL slugs for the exam names in the template's Lists sheet ("Exams" column),
// and which VERIFIED colleges and courses accept each one. Pure functions (server and client).
// "Own university test", "Merit (Class 12 marks)" and "None" are not exams with their own page:
// they have no slug and are shown as plain text.
import type { CollegeView, CourseView } from "./types";

const SLUGS: Record<string, string> = {
  "JEE Main": "jee-main",
  "JEE Advanced": "jee-advanced",
  "NEET UG": "neet-ug",
  "CUET UG": "cuet-ug",
  "CUET PG": "cuet-pg",
  CAT: "cat",
  MAT: "mat",
  CMAT: "cmat",
  XAT: "xat",
  CLAT: "clat",
  GATE: "gate",
  NATA: "nata",
};

/** The exam page slug for an exam name, or null when it has no page */
export const examSlug = (name: string): string | null => SLUGS[name] ?? null;

export const examPath = (slug: string) => `/colleges/exam/${slug}`;

/** Exams that appear in at least one verified course and have a page, A to Z */
export function examsInUse(colleges: CollegeView[]): { slug: string; name: string }[] {
  const names = new Set(colleges.flatMap((c) => c.courses.flatMap((k) => k.entranceExams)));
  return [...names]
    .filter((n) => examSlug(n))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ slug: examSlug(name)!, name }));
}

/** The exam's name and each verified college with the verified courses that accept it */
export function collegesForExam(colleges: CollegeView[], slug: string) {
  const name = Object.keys(SLUGS).find((n) => SLUGS[n] === slug) ?? null;
  if (!name) return null;
  const list = colleges
    .map((college) => ({ college, courses: college.courses.filter((k: CourseView) => k.entranceExams.includes(name)) }))
    .filter((x) => x.courses.length > 0);
  return { name, list };
}
