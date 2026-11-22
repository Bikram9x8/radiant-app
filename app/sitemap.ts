import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/blog";
import { verifiedCountries, verifiedExams } from "@/lib/abroad";
import { SHOW_ABROAD, SHOW_SCHOOL } from "@/lib/features";
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

// sitemap.xml: public pages only. Pages behind a switch are listed only while it is on
// (Study Abroad while SHOW_ABROAD is on; School pages never while SHOW_SCHOOL is off).
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified?: string): Entry => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  });

  const posts = allPosts();

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
    page("/blog", posts[0]?.updated),
    ...posts.map((p) => page(`/blog/${p.slug}`, p.updated)),
  ]);
}
