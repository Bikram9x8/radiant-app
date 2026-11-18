// Checks the Study Abroad data (run by scripts/check-abroad-data.ts before every build).
// Every fact (any object with a "value" key) must have an https sourceUrl, a sourceName and a
// valid lastChecked date that is not in the future: otherwise it is an ERROR and the build fails.
// Facts checked more than STALE_DAYS ago are a WARNING only.
// Also checked: unique slugs, https officialUrl on scholarships, and a country cannot have both a
// tuition figure and tuitionSetByUniversity.

export const STALE_DAYS = 180;

export type Issue = { level: "error" | "warning"; where: string; message: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isHttpsUrl(v: unknown) {
  if (typeof v !== "string") return false;
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
}

function checkFact(fact: Record<string, unknown>, where: string, today: Date, issues: Issue[]) {
  if (!isHttpsUrl(fact.sourceUrl)) {
    issues.push({ level: "error", where, message: "fact has no valid https sourceUrl" });
  }
  if (typeof fact.sourceName !== "string" || fact.sourceName.trim() === "") {
    issues.push({ level: "error", where, message: "fact has no sourceName" });
  }
  const checked = fact.lastChecked;
  if (typeof checked !== "string" || !ISO_DATE.test(checked) || Number.isNaN(Date.parse(checked))) {
    issues.push({ level: "error", where, message: "fact has no valid lastChecked date (YYYY-MM-DD)" });
    return;
  }
  const date = new Date(checked + "T00:00:00Z");
  if (date.getTime() > today.getTime()) {
    issues.push({ level: "error", where, message: `lastChecked ${checked} is in the future` });
    return;
  }
  const ageDays = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  if (ageDays > STALE_DAYS) {
    issues.push({ level: "warning", where, message: `last checked ${checked} (${ageDays} days ago): please re-check` });
  }
}

// Walk any value; every object with a "value" key is treated as a fact
function walk(node: unknown, where: string, today: Date, issues: Issue[]) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${where}[${i}]`, today, issues));
    return;
  }
  if (!isObject(node)) return;
  if ("value" in node) {
    checkFact(node, where, today, issues);
    return;
  }
  for (const [key, child] of Object.entries(node)) walk(child, `${where}.${key}`, today, issues);
}

export function validateAbroadData(
  data: { countries: unknown[]; exams: unknown[]; scholarships: unknown[]; rates: unknown[] },
  today: Date = new Date(),
): Issue[] {
  const issues: Issue[] = [];
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  for (const [name, list] of Object.entries(data)) {
    const seen = new Set<string>();
    list.forEach((item, i) => {
      const where = isObject(item) && typeof item.slug === "string" ? `${name}:${item.slug}` : `${name}[${i}]`;
      if (isObject(item) && typeof item.slug === "string") {
        if (seen.has(item.slug)) issues.push({ level: "error", where, message: "duplicate slug" });
        seen.add(item.slug);
        if (["exams", "scholarships"].includes(item.slug) && name === "countries") {
          issues.push({ level: "error", where, message: "country slug clashes with a fixed /abroad route" });
        }
      }
      if (name === "countries" && isObject(item) && item.tuitionSetByUniversity && item.tuitionPerYear) {
        issues.push({ level: "error", where, message: "tuitionSetByUniversity and tuitionPerYear cannot both be set" });
      }
      if (name === "scholarships" && isObject(item) && !isHttpsUrl(item.officialUrl)) {
        issues.push({ level: "error", where, message: "scholarship has no valid https officialUrl" });
      }
      // A rate is itself a fact
      walk(item, where, todayUtc, issues);
    });
  }
  return issues;
}
