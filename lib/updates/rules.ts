// Rules for "Latest updates" items, shared by scripts/import-updates.ts and scripts/verify-update.ts.
// Pure functions, no database.

export const UPDATE_TYPES = ["Internship", "PhD", "MS", "Workshop", "Fellowship", "Scholarship", "Exam date"] as const;

export const SOURCE_TYPES = ["Official page", "Official vacancy", "Supervisor post", "Organisation post"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/** Source types whose link may be the person's or organisation's own post (e.g. on LinkedIn) */
export const POST_SOURCES: readonly string[] = ["Supervisor post", "Organisation post"];

// Never a source: forwards and aggregator sites (subdomains included)
const BLOCKED = [
  "whatsapp.com",
  "wa.me",
  "shiksha.com",
  "collegedunia.com",
  "careers360.com",
  "opportunitiesforyouth.org",
  "opportunitiesforyouth.com",
  "jobleads.com",
  "getmyuni.com",
  "collegedekho.com",
  "telegram.me",
  "t.me",
];
const SOCIAL = ["linkedin.com", "lnkd.in"];

const onHost = (host: string, list: string[]) => list.some((d) => host === d || host.endsWith("." + d));

/** Problems with one link for an item of this source type ([] = fine) */
export function linkProblems(url: string, sourceType: string, column: string): string[] {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return [`${column} is not a valid link ("${url}")`];
  }
  const host = u.hostname.toLowerCase();
  const out: string[] = [];
  if (u.protocol !== "https:") out.push(`${column} must start with https:// ("${url}")`);
  if (onHost(host, BLOCKED)) out.push(`${column} is a forward or aggregator site (${host}), never a source`);
  if (onHost(host, SOCIAL) && !POST_SOURCES.includes(sourceType))
    out.push(`${column} is a LinkedIn link: allowed only when source_type is "Supervisor post" or "Organisation post"`);
  return out;
}

/** URL slug from title + organisation, e.g. "winter-school-2026-in-semiconductor-technology-cense-iisc-bengaluru" */
export function updateSlug(title: string, organisation: string) {
  return `${title} ${organisation}`
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/, "");
}
