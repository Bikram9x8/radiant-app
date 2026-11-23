// Search-engine data for the college pages (JSON-LD and breadcrumbs). Built only from VERIFIED
// colleges (CollegeView), and only from facts that have an official source: the address and the
// official website come from basic_info_source_url, so they are left out when that source is empty.
// Never fees, ratings, rankings or reviews.
import { absoluteUrl } from "@/lib/site";
import type { CollegeView } from "./types";

export const collegesPath = "/colleges";
export const collegePath = (slug: string) => `/colleges/${slug}`;
/** The college list filtered to one state (the finder reads ?state=) */
export const statePath = (state: string) => `/colleges?state=${encodeURIComponent(state)}`;

export type Crumb = { name: string; path: string };

/** Colleges > State > College (State only when known) */
export function collegeCrumbs(c: CollegeView): Crumb[] {
  return [
    { name: "Colleges", path: collegesPath },
    ...(c.state ? [{ name: c.state, path: statePath(c.state) }] : []),
    { name: c.name, path: collegePath(c.slug) },
  ];
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: absoluteUrl(x.path),
    })),
  };
}

export function collegeJsonLd(c: CollegeView) {
  const url = absoluteUrl(collegePath(c.slug));
  const sourced = !!c.src.basic; // address and website are basic-info facts
  const address =
    sourced && (c.fullAddress || c.city || c.state || c.pincode)
      ? {
          "@type": "PostalAddress",
          ...(c.fullAddress ? { streetAddress: c.fullAddress } : {}),
          ...(c.city ? { addressLocality: c.city } : {}),
          ...(c.state ? { addressRegion: c.state } : {}),
          ...(c.pincode ? { postalCode: c.pincode } : {}),
          addressCountry: "IN",
        }
      : null;
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": `${url}#college`,
    name: c.name,
    url,
    ...(c.officialWebsite && sourced ? { sameAs: [c.officialWebsite] } : {}),
    ...(address ? { address } : {}),
  };
}

/** For <script type="application/ld+json">: "<" is escaped so the text can't close the script tag */
export const jsonLdHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
