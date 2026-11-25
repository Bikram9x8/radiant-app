// Compare: which colleges are picked lives in the URL only (?c=slug1,slug2[,slug3] on
// /colleges/compare, ?compare=... on /colleges while picking). No login and no storage.
export const COMPARE_MAX = 3;
export const COMPARE_MIN = 2;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Clean list from a query value: valid slugs only, no repeats, at most COMPARE_MAX */
export function parseCompare(q: string | string[] | undefined): string[] {
  const raw = (Array.isArray(q) ? q.join(",") : (q ?? "")).split(",").map((s) => s.trim().toLowerCase());
  return [...new Set(raw.filter((s) => SLUG.test(s)))].slice(0, COMPARE_MAX);
}

export const comparePath = (slugs: string[]) => `/colleges/compare?c=${slugs.join(",")}`;
