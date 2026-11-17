"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { Skeleton } from "@/components/Skeleton";
import PostCard, { type PostCardData } from "@/components/tests/PostCard";
import s from "@/components/school/school.module.css";
import { SCHOOL_TEST_DIVISION, TEST_CLASSES, TEST_TYPE_FILTERS, parseClassSubject } from "@/lib/test-posts";
import { SHOW_SCHOOL } from "@/lib/features";

// Type chips: board-level tests belong to School Education, so their chip is hidden while it's off
// (an old ?division=BOARD_LEVEL_TEST link then gets the friendly note, like other non-test divisions)
const VISIBLE_TYPE_FILTERS = SHOW_SCHOOL
  ? TEST_TYPE_FILTERS
  : TEST_TYPE_FILTERS.filter((f) => f.division !== SCHOOL_TEST_DIVISION);

// Class chips (and the per-class Subject chips that follow a class) only while School Education is on.
// With it off, students never see "Class 11/12": a Subject row (Physics, Mathematics...) is shown
// straight away instead, across classes. Old ?class= links simply show every test (the page doesn't
// read that parameter).
const SHOW_CLASS_FILTER = SHOW_SCHOOL;
const VISIBLE_CLASSES = TEST_CLASSES;

// Tests page: only tests (type QUIZ, or a chapter / board-level / DPP division; see lib/test-posts.ts).
// All filtering happens on the server: GET /api/opportunities?tests=1&...

const chip = `${s.flat} inline-flex min-h-11 items-center rounded-full px-4 text-sm font-extrabold no-underline`;
const chipOn = "border border-(--line) bg-(--hp-ink) text-white";
const chipOff = "border border-(--line) bg-white text-(--hp-ink) hover:bg-(--hp-butter)";
const rowLabel = "m-0 mr-1 text-sm font-extrabold text-(--hp-muted)";

function TestsContent() {
  const searchParams = useSearchParams();
  const division = searchParams.get("division") || "";
  // Old links like ?division=NCERT_SOLUTION point at things that aren't tests any more
  const isVisibleTestDivision = VISIBLE_TYPE_FILTERS.some((f) => f.division === division);
  const nonTestDivision = division !== "" && !isVisibleTestDivision;
  const activeDivision = isVisibleTestDivision ? division : "";

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [query, setQuery] = useState(search); // search text actually sent (debounced)
  const [classNo, setClassNo] = useState("");
  const [categoryId, setCategoryId] = useState(""); // subject within a class (School on)
  const [subjectName, setSubjectName] = useState(""); // subject across classes (School off)
  const [tests, setTests] = useState<PostCardData[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0); // time of the last load, for "Open till" / "Ended"

  // Wait until typing pauses before searching
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ tests: "1" });
      if (query) params.set("search", query);
      if (activeDivision) params.set("division", activeDivision);
      if (classNo) params.set("classNo", classNo);
      if (categoryId) params.set("categoryId", categoryId);
      if (subjectName) params.set("subject", subjectName);
      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      if (cancelled) return;
      const names: string[] = data.subjectNames || [];
      // The chosen subject has no tests under the new Type filter: go back to all subjects
      if (subjectName && !names.includes(subjectName)) {
        setSubjectName("");
        return;
      }
      setNow(Date.now());
      setTests(data.opportunities || []);
      setSubjects(data.subjects || []);
      setSubjectNames(names);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [query, activeDivision, classNo, categoryId, subjectName]);

  function pickClass(c: string) {
    setClassNo(c);
    setCategoryId("");
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pt-6 pb-14 sm:px-8 md:pt-8">
      <nav
        aria-label="Breadcrumb"
        className={`${s.crumbs} flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-(--hp-muted)`}
      >
        <Link href="/" className="inline-flex min-h-11 items-center">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-(--hp-ink)">Tests</span>
      </nav>

      {/* Header card with the search box */}
      <div className="mt-2 rounded-[18px] border border-(--line) bg-(--hp-lavender) p-5 shadow-soft sm:p-8 md:rounded-[18px]">
        <h1 className={`${s.display} m-0 text-[38px] leading-[1.1] font-bold sm:text-[46px] md:text-[54px]`}>Tests</h1>
        <p className="mt-2 max-w-[56ch] text-[17px] leading-[1.55] font-semibold">
          {SHOW_SCHOOL
            ? "Practise with test series, chapter tests, board-level tests and DPPs for your class."
            : "Entrance exam prep for JEE and NEET: test series, chapter tests and DPPs."}
        </p>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
          className={`${s.search} mt-5 flex h-14 w-full max-w-[640px] items-center gap-2 rounded-full border border-(--line) bg-white pr-1.5 pl-4 sm:h-16`}
        >
          <label htmlFor="tests-search" className="sr-only">Search tests</label>
          <IconSearch aria-hidden="true" size={22} className="shrink-0 text-(--hp-muted)" />
          <input
            id="tests-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests, e.g. Integrals"
            className="min-w-0 flex-1 bg-transparent py-2 text-[17px] font-semibold text-(--hp-ink) outline-none placeholder:text-(--hp-muted)"
          />
          <button
            type="submit"
            className={`${s.flat} h-11 shrink-0 rounded-full bg-(--hp-ink) px-5 font-extrabold text-white sm:h-12`}
          >
            Search
          </button>
        </form>
      </div>

      {nonTestDivision && (
        <div role="note" className="mt-6 rounded-[20px] border border-(--line) bg-(--hp-butter) p-4 text-[15px] font-semibold sm:p-5">
          {SHOW_SCHOOL ? (
            <>
              This page now shows tests only. Notes, NCERT solutions and sample papers are in{" "}
              <Link href="/school" className="font-extrabold text-(--hp-link) underline underline-offset-4">
                School Education
              </Link>
              , chapter by chapter. Here are all the tests:
            </>
          ) : (
            <>
              This page shows entrance exam tests only. For colleges, courses and scholarships, see{" "}
              <Link href="/higher" className="font-extrabold text-(--hp-link) underline underline-offset-4">
                Higher Education
              </Link>
              . Here are all the tests:
            </>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mt-7 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className={rowLabel}>Type</p>
          <Link href="/opportunities" aria-current={!activeDivision ? "page" : undefined} className={`${chip} ${!activeDivision ? chipOn : chipOff}`}>
            All tests
          </Link>
          {VISIBLE_TYPE_FILTERS.map((f) => {
            const on = activeDivision === f.division;
            return (
              <Link
                key={f.division}
                href={`/opportunities?division=${f.division}`}
                aria-current={on ? "page" : undefined}
                className={`${chip} ${on ? chipOn : chipOff}`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* School switched off: Subject chips straight away, across classes (no class is shown) */}
        {!SHOW_CLASS_FILTER && subjectNames.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <p className={rowLabel}>Subject</p>
            <button
              type="button"
              onClick={() => setSubjectName("")}
              aria-pressed={!subjectName}
              className={`${chip} ${!subjectName ? chipOn : chipOff}`}
            >
              All
            </button>
            {subjectNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSubjectName(name)}
                aria-pressed={subjectName === name}
                className={`${chip} ${subjectName === name ? chipOn : chipOff}`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {SHOW_CLASS_FILTER && (
          <div className="flex flex-wrap items-center gap-2">
            <p className={rowLabel}>Class</p>
            <button type="button" onClick={() => pickClass("")} aria-pressed={!classNo} className={`${chip} ${!classNo ? chipOn : chipOff}`}>
              All
            </button>
            {VISIBLE_CLASSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pickClass(c)}
                aria-pressed={classNo === c}
                aria-label={`Class ${c}`}
                className={`${chip} min-w-11 justify-center ${classNo === c ? chipOn : chipOff}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {SHOW_CLASS_FILTER && classNo && subjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <p className={rowLabel}>Subject</p>
            <button
              type="button"
              onClick={() => setCategoryId("")}
              aria-pressed={!categoryId}
              className={`${chip} ${!categoryId ? chipOn : chipOff}`}
            >
              All
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setCategoryId(sub.id)}
                aria-pressed={categoryId === sub.id}
                className={`${chip} ${categoryId === sub.id ? chipOn : chipOff}`}
              >
                {parseClassSubject(sub.name).subject ?? sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count + results */}
      <p aria-live="polite" className="mt-7 mb-4 text-[15px] font-extrabold text-(--hp-muted)">
        {loading && tests.length === 0 ? "Loading tests…" : `${tests.length} test${tests.length === 1 ? "" : "s"}`}
      </p>

      {loading && tests.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[22px] border border-(--line)/20 bg-white p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-6 w-3/4" />
              <Skeleton className="mt-3 h-4 w-1/2" />
              <Skeleton className="mt-6 h-4 w-16" />
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-[18px] border border-(--line) bg-white p-8 text-center">
          <p className={`${s.display} m-0 text-2xl font-bold`}>No tests found</p>
          <p className="mx-auto mt-2 max-w-[44ch] text-base font-semibold text-(--hp-muted)">
            Try another class or test type, or clear the search.
          </p>
        </div>
      ) : (
        <div className={`grid gap-5 sm:grid-cols-2 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          {tests.map((t) => (
            <PostCard key={t.id} post={t} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestsPage() {
  return (
    <div className={`${s.page} flex-1`}>
      <Suspense
        fallback={<div className="flex flex-1 items-center justify-center py-20 font-bold text-(--hp-muted)">Loading...</div>}
      >
        <TestsContent />
      </Suspense>
    </div>
  );
}
