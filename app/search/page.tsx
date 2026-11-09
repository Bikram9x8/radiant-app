import type { Metadata } from "next";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/tests/PostCard";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/school/school.module.css";
import { DIVISION_LABELS } from "@/lib/test-posts";
import type { Division } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search · Radiant Educations",
  description: "Search notes, NCERT solutions, sample papers and tests.",
};

// How many results are shown at most (62 approved posts today, so "View all" shows everything)
const LIMIT = 100;

// Loads the results, and the time they were loaded (for "Open till" / "Ended" on tests)
async function loadPosts(q: string, division: string) {
  const posts = await prisma.opportunity.findMany({
    where: {
      status: "APPROVED",
      ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
      ...(division ? { division: division as Division } : {}),
    },
    select: {
      id: true,
      title: true,
      type: true,
      division: true,
      contentType: true,
      chapter: true,
      requiresCode: true,
      applyDeadline: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: LIMIT,
  });
  return { posts, now: Date.now() };
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v ?? "");

// Searches ALL approved posts by title (notes, solutions, sample papers, tests...).
// The homepage search box sends people here; without ?q= it lists the newest posts ("View all").
// ?division=NCERT_SOLUTION etc. (from the student dashboard) shows only that division.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; division?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = first(params.q).trim().slice(0, 100);
  const divisionParam = first(params.division);
  // Only real division names are used; anything else is ignored
  const division = DIVISION_LABELS[divisionParam] ? divisionParam : "";
  const divisionLabel = division ? DIVISION_LABELS[division] : "";
  const { posts, now } = await loadPosts(q, division);

  const heading = q
    ? `Results for “${q}”`
    : divisionLabel || "All study material";

  return (
    <div className={`${fredoka.variable} ${nunito.variable} ${s.page} flex-1`}>
      <div className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-14 sm:px-8 md:pt-8">
        <nav
          aria-label="Breadcrumb"
          className={`${s.crumbs} flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-(--hp-muted)`}
        >
          <Link href="/" className="inline-flex min-h-11 items-center">Home</Link>
          <span aria-hidden="true">/</span>
          {divisionLabel ? (
            <>
              <Link href="/search" className="inline-flex min-h-11 items-center">Search</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-(--hp-ink)">{divisionLabel}</span>
            </>
          ) : (
            <span aria-current="page" className="text-(--hp-ink)">Search</span>
          )}
        </nav>

        <div className="mt-2 rounded-[28px] border-[3px] border-(--hp-ink) bg-(--hp-lavender) p-5 shadow-[6px_6px_0_var(--hp-ink)] sm:p-8 md:rounded-[36px]">
          <h1 className={`${s.display} m-0 text-[34px] leading-[1.12] font-bold break-words sm:text-[42px] md:text-[50px]`}>
            {heading}
          </h1>
          <p className="mt-2 max-w-[56ch] text-[17px] leading-[1.55] font-semibold">
            Notes, NCERT solutions, sample papers and tests, all in one place.
          </p>
          <form
            action="/search"
            method="get"
            role="search"
            className={`${s.search} mt-5 flex h-14 w-full max-w-[640px] items-center gap-2 rounded-full border-[3px] border-(--hp-ink) bg-white pr-1.5 pl-4 sm:h-16`}
          >
            {/* Searching while a division is chosen stays inside that division */}
            {division && <input type="hidden" name="division" value={division} />}
            <label htmlFor="site-search" className="sr-only">
              {divisionLabel ? `Search ${divisionLabel}` : "Search notes, solutions and tests"}
            </label>
            <IconSearch aria-hidden="true" size={22} className="shrink-0 text-(--hp-muted)" />
            <input
              id="site-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search a chapter, test or topic"
              className="min-w-0 flex-1 bg-transparent py-2 text-[17px] font-semibold text-(--hp-ink) outline-none placeholder:text-(--hp-muted)"
            />
            <button
              type="submit"
              className={`${s.flat} h-11 shrink-0 rounded-full bg-(--hp-ink) px-5 font-extrabold text-white sm:h-12`}
            >
              Search
            </button>
          </form>
          {divisionLabel && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-[15px] font-bold">
              <span className="rounded-full border-2 border-(--hp-ink) bg-white px-3 py-1">Only: {divisionLabel}</span>
              <Link
                href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
                className="inline-flex min-h-11 items-center font-extrabold text-(--hp-link) underline underline-offset-4"
              >
                Show everything
              </Link>
            </p>
          )}
        </div>

        <p className="mt-7 mb-4 text-[15px] font-extrabold text-(--hp-muted)">
          {posts.length === LIMIT
            ? `Showing the first ${LIMIT} results`
            : `${posts.length} result${posts.length === 1 ? "" : "s"}`}
        </p>

        {posts.length === 0 ? (
          <div className="rounded-[24px] border-[3px] border-(--hp-ink) bg-white p-8 text-center">
            <p className={`${s.display} m-0 text-2xl font-bold`}>
              {q ? `Nothing matches “${q}”` : `No ${divisionLabel || "study material"} yet`}
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] text-base font-semibold text-(--hp-muted)">
              Try a shorter word, or browse{" "}
              <Link href="/school" className="font-extrabold text-(--hp-link) underline underline-offset-4">
                School Education
              </Link>{" "}
              chapter by chapter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} now={now} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
