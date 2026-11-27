import type { Metadata } from "next";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/tests/PostCard";
import s from "@/components/school/school.module.css";
import g from "@/components/search/search.module.css";
import { DIVISION_LABELS, endedTestWhere, postSearchText } from "@/lib/test-posts";
import type { Division } from "@prisma/client";
import { SHOW_COLLEGES, SHOW_SCHOOL } from "@/lib/features";
import { notSchoolWhere } from "@/lib/school-posts";
import { searchSite, type SearchGroups } from "@/lib/search";
import { deadlineLabel } from "@/lib/updates/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search · Radiant Educations",
  description: SHOW_SCHOOL
    ? "Search notes, NCERT solutions, sample papers and tests."
    : SHOW_COLLEGES
      ? "Search colleges, courses, entrance exams, latest updates and tests."
      : "Search tests, exam prep and study material.",
};

// How many results are shown at most (62 approved posts today, so "View all" shows everything)
const LIMIT = 100;

// Loads the results, and the time they were loaded (for "Open till" / "Ended" on tests).
// With a search word, a post matches when every word appears in its title or in what its card shows
// about it ("Test series", "JEE prep · Mathematics"...; see postSearchText). Those labels are worked out
// from the type, division and category, so this filter runs on the approved, visible posts (a few dozen).
async function loadPosts(q: string, division: string) {
  const rows = await prisma.opportunity.findMany({
    where: {
      status: "APPROVED",
      ...(division ? { division: division as Division } : {}),
      // School posts are left out while School Education is switched off
      ...(SHOW_SCHOOL ? {} : notSchoolWhere),
      // Ended tests are left out (lib/test-posts.ts); AND keeps notSchoolWhere's own NOT intact
      AND: [{ NOT: endedTestWhere() }],
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
    ...(q ? {} : { take: LIMIT }),
  });
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const posts = (
    words.length ? rows.filter((p) => words.every((w) => postSearchText(p).toLowerCase().includes(w))) : rows
  ).slice(0, LIMIT);
  return { posts, now: Date.now() };
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v ?? "");

// One group of results: heading with its count (empty groups are not shown). Styles: search.module.css,
// so new styles never change the site-wide stylesheet.
function Group({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className={g.group}>
      <h2 id={id} className={`${s.display} ${g.groupTitle}`}>
        {title}
        <span className={g.groupCount}>{count}</span>
      </h2>
      {children}
    </section>
  );
}

// Colleges (with matching courses), exams with a page, and open Latest updates
function SiteGroups({ groups }: { groups: SearchGroups }) {
  return (
    <>
      {groups.colleges.length > 0 && (
        <Group id="r-colleges" title="Colleges" count={groups.colleges.length}>
          <ul className={g.rows}>
            {groups.colleges.map((c) => (
              <li key={c.slug}>
                <Link href={`/colleges/${c.slug}`} className={g.row}>
                  <span className={g.name}>{c.name}</span>
                  {c.place && <span className={g.sub}>{c.place}</span>}
                  {c.courses.length > 0 && <span className={g.courses}>Courses: {c.courses.join(" · ")}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {groups.exams.length > 0 && (
        <Group id="r-exams" title="Exams" count={groups.exams.length}>
          <ul className={g.rows}>
            {groups.exams.map((e) => (
              <li key={e.slug}>
                <Link href={`/colleges/exam/${e.slug}`} className={g.row}>
                  <span className={g.name}>{e.name}</span>
                  <span className={g.sub}>
                    {e.colleges} checked {e.colleges === 1 ? "college accepts" : "colleges accept"} it
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {groups.updates.length > 0 && (
        <Group id="r-updates" title="Latest updates" count={groups.updates.length}>
          <ul className={g.rows}>
            {groups.updates.map((u) => (
              <li key={u.slug}>
                <Link href={`/updates?type=${encodeURIComponent(u.type)}`} className={g.row}>
                  <span className={g.kicker}>
                    {u.type} · {deadlineLabel(u.deadline)}
                  </span>
                  <span className={g.name}>{u.title}</span>
                  <span className={g.sub}>{u.organisation}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Group>
      )}
    </>
  );
}

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
  // Colleges, exams and updates: only for a search word, and not inside a chosen division
  const groups = q && !division ? await searchSite(q) : { colleges: [], exams: [], updates: [] };
  const siteCount = groups.colleges.length + groups.exams.length + groups.updates.length;
  const total = posts.length + siteCount;

  const heading = q
    ? `Results for “${q}”`
    : divisionLabel || "All study material";

  return (
    <div className={`${s.page} flex-1`}>
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

        <div className="mt-2 rounded-[18px] border border-(--line) bg-(--hp-lavender) p-5 shadow-soft sm:p-8 md:rounded-[18px]">
          <h1 className={`${s.display} m-0 text-[34px] leading-[1.12] font-bold break-words sm:text-[42px] md:text-[50px]`}>
            {heading}
          </h1>
          <p className="mt-2 max-w-[56ch] text-[17px] leading-[1.55] font-semibold">
            {SHOW_SCHOOL
              ? "Notes, NCERT solutions, sample papers and tests, all in one place."
              : SHOW_COLLEGES
                ? "Colleges, courses, entrance exams, latest updates and tests, all in one place."
                : "Tests, exam prep and study material, all in one place."}
          </p>
          <form
            action="/search"
            method="get"
            role="search"
            className={`${s.search} mt-5 flex h-14 w-full max-w-[640px] items-center gap-2 rounded-full border border-(--line) bg-white pr-1.5 pl-4 sm:h-16`}
          >
            {/* Searching while a division is chosen stays inside that division */}
            {division && <input type="hidden" name="division" value={division} />}
            <label htmlFor="site-search" className="sr-only">
              {divisionLabel
                ? `Search ${divisionLabel}`
                : SHOW_COLLEGES
                  ? "Search colleges, exams, updates and tests"
                  : "Search notes, solutions and tests"}
            </label>
            <IconSearch aria-hidden="true" size={22} className="shrink-0 text-(--hp-muted)" />
            <input
              id="site-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={SHOW_COLLEGES ? "Search colleges, exams or tests" : "Search a chapter, test or topic"}
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
              <span className="rounded-full border border-(--line) bg-white px-3 py-1">Only: {divisionLabel}</span>
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
            : `${total} result${total === 1 ? "" : "s"}`}
        </p>

        {siteCount > 0 && <SiteGroups groups={groups} />}

        {total === 0 ? (
          <div className="rounded-[18px] border border-(--line) bg-white p-8 text-center">
            <p className={`${s.display} m-0 text-2xl font-bold`}>
              {q ? `Nothing matches “${q}”` : `No ${divisionLabel || "study material"} yet`}
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] text-base font-semibold text-(--hp-muted)">
              Try a shorter word, or browse{" "}
              {!SHOW_SCHOOL && SHOW_COLLEGES ? (
                <>
                  <Link href="/colleges" className="font-extrabold text-(--hp-link) underline underline-offset-4">
                    colleges
                  </Link>{" "}
                  or{" "}
                  <Link href="/exams" className="font-extrabold text-(--hp-link) underline underline-offset-4">
                    entrance exams
                  </Link>
                  .
                </>
              ) : (
                <>
                  <Link
                    href={SHOW_SCHOOL ? "/school" : "/higher"}
                    className="font-extrabold text-(--hp-link) underline underline-offset-4"
                  >
                    {SHOW_SCHOOL ? "School Education" : "Higher Education"}
                  </Link>
                  {SHOW_SCHOOL ? " chapter by chapter." : "."}
                </>
              )}
            </p>
          </div>
        ) : posts.length === 0 ? null : q && !division ? (
          <Group id="r-posts" title="Tests & posts" count={posts.length}>
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} now={now} />
              ))}
            </div>
          </Group>
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
