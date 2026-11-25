import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/blog";
import { verifiedCountries, verifiedExams } from "@/lib/abroad";
import { SHOW_ABROAD, SHOW_COLLEGES, SHOW_SCHOOL } from "@/lib/features";
import { absoluteUrl, SITE_URL } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

// Every entry must have an absolute <loc> on this site. A missing or bad slug (empty, "undefined",
// "null") fails the build instead of publishing an empty <url></url>. Duplicates fail too.
function validLoc(url: unknown) {
  if (typeof url !== "string" || !url.startsWith(`${SITE_URL}/`)) return false;
  const path = url.slice(SITE_URL.length);
  if (path === "/") return true;
  return path
    .slice(1)
    .split("/")
    .every((seg) => seg !== "" && seg !== "undefined" && seg !== "null");
}

function checkSitemap(entries: Entry[]): Entry[] {
  const bad = entries.filter((e) => !validLoc(e?.url));
  if (bad.length) throw new Error(`sitemap: entries without a valid <loc>: ${JSON.stringify(bad)}`);
  const urls = entries.map((e) => e.url);
  const dup = urls.find((u, i) => urls.indexOf(u) !== i);
  if (dup) throw new Error(`sitemap: duplicate <loc> ${dup}`);
  return entries;
}

// Colleges, college pages and exam pages (only called while SHOW_COLLEGES is on). Compare pages are
// combinations (noindex), so they are never listed.
async function collegeEntries(page: (path: string) => Entry): Promise<Entry[]> {
  const { verifiedColleges } = await import("@/lib/colleges/data");
  const { examPath, examsInUse } = await import("@/lib/colleges/exams");
  const list = await verifiedColleges();
  return [
    page("/colleges"),
    ...list.map((c) => page(`/colleges/${c.slug}`)),
    ...examsInUse(list).map((e) => page(examPath(e.slug))),
  ];
}

// sitemap.xml: public pages only. Pages behind a switch are listed only while it is on
// (Study Abroad while SHOW_ABROAD is on; School pages never while SHOW_SCHOOL is off;
// Colleges, each VERIFIED college page and the exam pages only while SHOW_COLLEGES is on).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: string, lastModified?: string): Entry => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  });

  const posts = allPosts();

  // Colleges: the database is read only while the switch is on (imported here, so an "off" build never
  // loads it). Read at build time like the rest of this file; draft colleges are never listed.
  // Exam pages (/colleges/exam/...) are listed for each exam a verified course accepts.
  const colleges = SHOW_COLLEGES ? await collegeEntries(page) : [];

  return checkSitemap([
    page("/"),
    page("/higher"),
    page("/opportunities"),
    ...(SHOW_SCHOOL ? [page("/school")] : []),
    ...(SHOW_ABROAD
      ? [
          page("/abroad"),
          ...verifiedCountries().map((c) => page(`/abroad/${c.slug}`)),
          ...verifiedExams().map((e) => page(`/abroad/exams/${e.slug}`)),
          page("/abroad/scholarships"),
        ]
      : []),
    ...colleges,
    page("/blog", posts[0]?.updated),
    ...posts.map((p) => page(`/blog/${p.slug}`, p.updated)),
  ]);
}
