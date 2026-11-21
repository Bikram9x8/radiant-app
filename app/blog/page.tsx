import type { Metadata } from "next";
import Link from "next/link";
import { allPosts } from "@/lib/blog";
import { formatDate } from "@/lib/abroad/format";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import s from "@/components/blog/blog.module.css";

const DESCRIPTION =
  "Clear guides for students in India. Every number comes from an official source, with the date we checked it.";

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: { type: "website", url: absoluteUrl("/blog"), title: `Blog | ${SITE_NAME}`, description: DESCRIPTION, siteName: SITE_NAME },
};

// Blog list: articles from content/blog, newest first (static, no database)
export default function BlogPage() {
  const posts = allPosts();
  return (
    <div className={`${s.page} flex-1`}>
      <div className={s.wrap}>
        <div className={s.head}>
          <h1 className={s.h1}>
            Blog <span className={s.ser}>guides</span>
          </h1>
          <p className={s.lead}>{DESCRIPTION}</p>
        </div>

        <ul className={s.list}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className={s.card}>
                <span className={s.chip}>{p.category}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                <p className={s.meta}>
                  Updated <time dateTime={p.updated}>{formatDate(p.updated)}</time> · {p.readingMinutes} min read
                </p>
                <span className={s.cardGo} aria-hidden="true">
                  Read the guide →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
