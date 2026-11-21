// Public address of the site, for canonical URLs, Open Graph, JSON-LD and the sitemap.
// Set NEXT_PUBLIC_SITE_URL (e.g. https://www.example.in) in Vercel once the final domain is known.
// Without it, Vercel's own production domain is used (VERCEL_PROJECT_PRODUCTION_URL, set at build),
// and local builds fall back to localhost.
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000";

export const SITE_URL = fromEnv.replace(/\/+$/, "");
export const SITE_NAME = "Radiant Educations";

/** Absolute URL for a path on this site, e.g. absoluteUrl("/blog") */
export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
