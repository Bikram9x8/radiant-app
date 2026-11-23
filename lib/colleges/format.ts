// Formatting for college pages. Pure functions (server and client). Nothing here calculates a fee:
// every amount is shown exactly as stored, with the label of the column it came from.
import type { CollegeView, CourseView, SourceRef } from "./types";

export const NOT_AVAILABLE = "Not available yet";

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function years(n: number) {
  return `${n} ${n === 1 ? "year" : "years"}`;
}

/** The fee lines a course shows, each exactly as published (no yearly or total fee is worked out) */
export function feeLines(k: CourseView): { amount: string; label: string }[] {
  const out: { amount: string; label: string }[] = [];
  if (k.feePerYearInr) out.push({ amount: inr(k.feePerYearInr), label: "Fee per year" });
  if (k.feePerSemesterInr)
    out.push({ amount: inr(k.feePerSemesterInr), label: k.feePerYearInr ? "Fee per semester" : "Fee per semester (1st year)" });
  if (k.totalFeeInr) out.push({ amount: inr(k.totalFeeInr), label: "Total fee for the course" });
  return out;
}

const BODIES: Record<string, string> = {
  "ugc.gov.in": "UGC",
  "naac.gov.in": "NAAC",
  "nirfindia.org": "NIRF",
  "aicte-india.org": "AICTE",
  "aicte.gov.in": "AICTE",
  "nta.ac.in": "NTA",
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** A short name for a source link: "UGC (PDF)", "Amity University Punjab website", ... */
export function sourceName(url: string, college: Pick<CollegeView, "name" | "shortName" | "officialWebsite">) {
  const host = hostOf(url);
  const body = Object.entries(BODIES).find(([h]) => host === h || host.endsWith("." + h))?.[1];
  const own = college.officialWebsite && hostOf(college.officialWebsite) === host;
  const name = body ?? (own ? `${college.shortName ?? college.name} website` : host);
  return /\.pdf($|\?)/i.test(url) ? `${name} (PDF)` : name;
}

/** One line per source page: facts that share a page and date are listed together */
export function mergeSources(items: { label: string; src: SourceRef | null }[]) {
  const map = new Map<string, { labels: string[]; src: SourceRef }>();
  for (const { label, src } of items) {
    if (!src) continue;
    const key = `${src.url}|${src.checked}`;
    const hit = map.get(key);
    if (hit) {
      if (!hit.labels.includes(label)) hit.labels.push(label);
    } else map.set(key, { labels: [label], src });
  }
  return [...map.values()];
}

export function place(c: Pick<CollegeView, "city" | "state">) {
  return [c.city, c.state].filter(Boolean).join(", ");
}
