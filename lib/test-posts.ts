// What counts as a "test" on the Tests page (/opportunities), shared by the API, the cards
// and the reading page. Plain constants and functions: safe to import on client and server.
//
// Rule (checked against the data on 2026-11-09): type QUIZ, or an explicitly chosen test
// division (Chapter-wise test, Board-level test, DPP). TEST_SERIES on its own does NOT count:
// it is the schema's default division, so it is set on posts nobody categorised, including
// 3 NCERT-style solutions (type SOLUTION). All real tests today are type QUIZ.

// Divisions that mark a post as a test even when its type isn't QUIZ
export const EXPLICIT_TEST_DIVISIONS = ["CHAPTER_WISE_TEST", "BOARD_LEVEL_TEST", "DPP"];

// The test-type chips on the Tests page, in order (division value -> label)
export const TEST_TYPE_FILTERS: { division: string; label: string }[] = [
  { division: "TEST_SERIES", label: "Test series" },
  { division: "CHAPTER_WISE_TEST", label: "Chapter tests" },
  { division: "BOARD_LEVEL_TEST", label: "Board-level tests" },
  { division: "DPP", label: "DPP" },
];

export const TEST_CLASSES = ["9", "10", "11", "12"];

// Every division (matches enum Division in prisma/schema.prisma) with a readable name.
// Used by /search?division=... (anything not in this list is ignored).
export const DIVISION_LABELS: Record<string, string> = {
  NCERT_SOLUTION: "NCERT Solutions",
  CBSE_SAMPLE_PAPERS: "CBSE Sample Papers",
  TEST_SERIES: "Test Series",
  SKILL_BUILDING: "Skill Building",
  CAREER_COUNSELING: "Career Counseling",
  STUDY_PACKAGE: "Study Packages",
  DPP: "Daily Practice Problems",
  BOARD_LEVEL_TEST: "Board Level Tests",
  CHAPTER_WISE_TEST: "Chapter Wise Tests",
};

export function isTestPost(p: { type?: string | null; division?: string | null }) {
  return p.type === "QUIZ" || EXPLICIT_TEST_DIVISIONS.includes(p.division ?? "");
}

export function isTestDivision(division: string) {
  return TEST_TYPE_FILTERS.some((f) => f.division === division);
}

// Category names look like "Class 12 - Physics"
export function parseClassSubject(categoryName?: string | null): { classNo?: string; subject?: string } {
  const m = (categoryName ?? "").match(/^Class\s*(\d{1,2})\s*-\s*(.+)$/i);
  return m ? { classNo: m[1], subject: m[2].trim() } : {};
}
