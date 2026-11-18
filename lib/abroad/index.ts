// Study Abroad data access. Pages list only "verified" items; "draft" items never render.
import { COUNTRIES } from "./countries";
import { EXAMS } from "./exams";
import { SCHOLARSHIPS } from "./scholarships";
import { RATES } from "./rates";
import type { Currency } from "./types";

export function verifiedCountries() {
  return COUNTRIES.filter((c) => c.status === "verified");
}

export function getCountry(slug: string) {
  return verifiedCountries().find((c) => c.slug === slug) ?? null;
}

export function verifiedExams() {
  return EXAMS.filter((e) => e.status === "verified");
}

export function getExam(slug: string) {
  return verifiedExams().find((e) => e.slug === slug) ?? null;
}

export function verifiedScholarships() {
  return SCHOLARSHIPS.filter((s) => s.status === "verified");
}

export function getRate(currency: Currency) {
  return RATES.find((r) => r.currency === currency) ?? null;
}
