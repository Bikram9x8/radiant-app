import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts, getPost } from "@/lib/blog";
import { formatDate } from "@/lib/abroad/format";
import { verifiedCountries } from "@/lib/abroad";
import { SHOW_ABROAD } from "@/lib/features";
import { fitTitle, absoluteUrl, SITE_NAME } from "@/lib/site";
import s from "@/components/blog/blog.module.css";

// Only articles in content/blog have a page; any other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: `Blog | ${SITE_NAME}` };
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    // Long post titles are cut at the colon ("Study abroad from India 2026") to stay under 65 characters
    title: fitTitle(`${post.title} | ${SITE_NAME}`, post.title, `${post.title.split(":")[0]} | ${SITE_NAME}`),
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: SITE_NAME,
      publishedTime: post.published,
      modifiedTime: post.updated,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

// Dates inside free text ("2026-11-18 to 2026-11-20") shown as "18 Nov 2026 to 20 Nov 2026"
function readableDates(text: string) {
  return text.replace(/\d{4}-\d{2}-\d{2}/g, (d) => formatDate(d));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published,
    dateModified: post.updated,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/icon-512.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: post.tags.join(", "),
  };

  // Links to the Study Abroad guides only while that section is switched on (otherwise they'd 404).
  // A country is linked when one of the article's tags names it (e.g. "Canada" or "UK").
  const tags = post.tags.map((t) => t.toLowerCase());
  const countries = SHOW_ABROAD
    ? verifiedCountries().filter((c) => tags.includes(c.name.toLowerCase()) || tags.includes(c.slug))
    : [];

  return (
    <div className={`${s.page} flex-1`}>
      <script
        type="application/ld+json"
        // JSON-LD for search engines; "<" is escaped so the text can't close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className={s.wrap}>
        <article className={s.article}>
          <p className={s.crumb}>
            <Link href="/blog">Blog</Link> / {post.category}
          </p>
          <span className={s.chip}>{post.category}</span>
          <h1 className={s.title}>{post.title}</h1>
          <p className={s.byline}>
            <b>{post.author}</b> · Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time> · Facts
            checked {readableDates(post.factsChecked)} · {post.readingMinutes} min read
          </p>

          {/* Article content comes from our own markdown files in content/blog (trusted, built at deploy) */}
          <div className={s.prose} dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

          {post.sourcesHtml && (
            <section className={`${s.prose} ${s.sources}`} aria-label="Sources">
              <div dangerouslySetInnerHTML={{ __html: post.sourcesHtml }} />
            </section>
          )}

          <nav className={s.more} aria-labelledby="blog-more">
            <h2 id="blog-more">Keep exploring</h2>
            <ul>
              {SHOW_ABROAD && (
                <li>
                  <Link href="/abroad" className={s.morePri}>
                    Study abroad guides
                  </Link>
                </li>
              )}
              {countries.map((c) => (
                <li key={c.slug}>
                  <Link href={`/abroad/${c.slug}`}>Study in {c.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/blog">All articles</Link>
              </li>
            </ul>
          </nav>
        </article>
      </div>
    </div>
  );
}
