// Course groups across colleges, by course_id (bca, btech-cse, mba...). Pure functions (server and client).
// The short label is only a display name for a filter; each college's own official course name is
// still shown on its page.
import type { CollegeView } from "./types";

const SHORT: Record<string, string> = {
  bca: "BCA",
  "btech-cse": "B.Tech/B.E. CSE",
  mba: "MBA",
};

/** Course groups in any of these colleges, labelled; known ids first, then A to Z */
export function courseGroups(colleges: CollegeView[]): { id: string; label: string }[] {
  const names = new Map<string, string[]>();
  for (const c of colleges) for (const k of c.courses) names.set(k.courseId, [...(names.get(k.courseId) ?? []), k.name]);
  return [...names.entries()]
    .map(([id, list]) => ({ id, label: SHORT[id] ?? list.sort((a, b) => a.length - b.length)[0] }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
