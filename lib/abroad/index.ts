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

/**
 * A short scholarship preview: one per country first (in data order, by each scholarship's first
 * country), then filled up with the rest, up to `max`.
 */
export function scholarshipPreview(max = 3) {
  const all = verifiedScholarships();
  const picked: typeof all = [];
  const seen = new Set<string>();
  for (const sch of all) {
    if (picked.length >= max) break;
    const country = sch.countries[0] ?? sch.slug;
    if (!seen.has(country)) {
      seen.add(country);
      picked.push(sch);
    }
  }
  for (const sch of all) {
    if (picked.length >= max) break;
    if (!picked.includes(sch)) picked.push(sch);
  }
  return picked;
}

export function getRate(currency: Currency) {
  return RATES.find((r) => r.currency === currency) ?? null;
}
