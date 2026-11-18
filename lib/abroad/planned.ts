import type { FlagCode, SceneCode } from "./types";

// What the Study Abroad section will cover. Names and drawings only, never facts or numbers:
// shown as "Coming soon" until the matching item in countries.ts / exams.ts is verified.
// Keep imports relative.

export const PLANNED_COUNTRIES: { slug: string; name: string; flag: FlagCode; scene: SceneCode }[] = [
  { slug: "canada", name: "Canada", flag: "ca", scene: "ca" },
  { slug: "uk", name: "United Kingdom", flag: "uk", scene: "uk" },
  { slug: "usa", name: "USA", flag: "us", scene: "us" },
  { slug: "australia", name: "Australia", flag: "au", scene: "au" },
  { slug: "germany", name: "Germany", flag: "de", scene: "de" },
  { slug: "ireland", name: "Ireland", flag: "ie", scene: "ie" },
];

export const PLANNED_EXAMS: { slug: string; name: string; purpose: string }[] = [
  { slug: "ielts", name: "IELTS", purpose: "English, 4 skills" },
  { slug: "pte", name: "PTE", purpose: "English, computer-based" },
  { slug: "toefl", name: "TOEFL", purpose: "English, iBT" },
  { slug: "gre", name: "GRE", purpose: "Graduate admissions" },
  { slug: "gmat", name: "GMAT", purpose: "Business school" },
  { slug: "sat", name: "SAT", purpose: "US undergraduate" },
];
