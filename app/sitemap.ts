import type { MetadataRoute } from "next";
import { allPosts } from "@/lib/blog";
import { verifiedCountries, verifiedExams } from "@/lib/abroad";
import { SHOW_ABROAD, SHOW_SCHOOL } from "@/lib/features";
import { absoluteUrl } from "@/lib/site";

// sitemap.xml: public pages only. Pages behind a switch are listed only while it is on
// (Study Abroad while SHOW_ABROAD is on; School pages never while SHOW_SCHOOL is off).
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  });

  const posts = allPosts();

  return [
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
  ];
}
