"use client";
import { useEffect, useState, useMemo, Suspense } from "react";import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconFileText, IconTool, IconTargetArrow, IconPackage, IconClipboardList, IconSchool, IconBook, IconBook2, IconLock, IconCertificate, IconSearch } from "@tabler/icons-react";
import FadeIn from "@/components/FadeIn";
import { Skeleton } from "@/components/Skeleton";
import { getShortLabel } from "@/lib/categoryLabel";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/school/school.module.css";

// Icon and pastel per division (Option B colours, used for the pills and the post cards)
const DIVISION_ICONS: Record<string, { Icon: any; bg: string }> = {
  NCERT_SOLUTION: { Icon: IconBook2, bg: "bg-(--hp-lavender)" },
  CBSE_SAMPLE_PAPERS: { Icon: IconCertificate, bg: "bg-(--hp-coral)" },
  TEST_SERIES: { Icon: IconFileText, bg: "bg-(--hp-mint)" },
  SKILL_BUILDING: { Icon: IconTool, bg: "bg-(--hp-pink)" },
  CAREER_COUNSELING: { Icon: IconTargetArrow, bg: "bg-(--hp-sky)" },
  STUDY_PACKAGE: { Icon: IconPackage, bg: "bg-(--hp-mint)" },
  DPP: { Icon: IconClipboardList, bg: "bg-(--hp-yellow)" },
  BOARD_LEVEL_TEST: { Icon: IconSchool, bg: "bg-(--hp-coral)" },
  CHAPTER_WISE_TEST: { Icon: IconBook, bg: "bg-(--hp-lavender)" },
};

const TYPES = ["JOB", "INTERNSHIP", "COMPETITION", "QUIZ", "SOLUTION", "HACKATHON", "EVENT"];

const TYPE_LABELS: Record<string, string> = {
  QUIZ: "Quiz / Test",
  SOLUTION: "Solution",
  INTERNSHIP: "Internship",
  JOB: "Job",
  COMPETITION: "Competition",
  HACKATHON: "Hackathon",
  EVENT: "Event",
};

// Shared class strings
const stepLabel = "m-0 mb-2 text-[15px] font-extrabold text-(--hp-muted)";
const pillBase = `${s.flat} inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold`;
const pillOn = "border-[3px] border-(--hp-ink) bg-(--hp-ink) text-white";
const pillOff = "border-2 border-(--hp-ink) bg-white text-(--hp-ink) hover:bg-(--hp-butter)";
const textButton = "inline-flex min-h-11 items-center px-1 text-sm font-extrabold text-(--hp-link) underline-offset-4 hover:underline";
const fieldClass = `${s.field} min-h-12 rounded-full px-4 text-base font-semibold`;

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const division = searchParams.get("division") || "";

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // ?q= comes from the homepage search box; it pre-fills the search
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const { classGroups, otherCategories } = useMemo(() => {
    const groups: Record<string, { id: string; name: string; subject: string }[]> = {};
    const others: any[] = [];
    categories.forEach((c) => {
      const m = c.name.match(/^Class\s*(\d{1,2})\s*-\s*(.+)$/i);
      if (m) {
        const label = `Class ${m[1]}`;
        const subject = m[2].trim();
        if (!groups[label]) groups[label] = [];
        groups[label].push({ id: c.id, name: c.name, subject });
      } else {
        others.push(c);
      }
    });
    return { classGroups: groups, otherCategories: others };
  }, [categories]);

  const classList = Object.keys(classGroups).sort(
    (a, b) => parseInt(a.replace("Class ", "")) - parseInt(b.replace("Class ", ""))
  );

  const chapterList = useMemo(() => {
    const set = new Set<number>();
    opportunities.forEach((op) => {
      if (op.chapter) set.add(op.chapter);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [opportunities]);

  const displayedOpportunities = selectedChapter
    ? opportunities.filter((op) => op.chapter === parseInt(selectedChapter, 10))
    : opportunities;

  const selectedSubjectName = classGroups[selectedClass]?.find((c) => c.id === categoryId)?.subject || "";

  function resetToAllClasses() {
    setSelectedClass("");
    setCategoryId("");
    setSelectedChapter("");
  }

  function selectClass(label: string) {
    setSelectedClass(label);
    setCategoryId("");
    setSelectedChapter("");
  }

  function selectSubject(id: string) {
    setCategoryId(id);
    setSelectedChapter("");
  }

  useEffect(() => {
    resetToAllClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (categoryId) params.set("categoryId", categoryId);
      if (division) params.set("division", division);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setCategories(data.categories || []);
      setLoading(false);
    }
    load();
  }, [search, type, categoryId, division]);

  const divisionTitle =
    division === "NCERT_SOLUTION"
      ? "NCERT Solutions"
      : division === "CBSE_SAMPLE_PAPERS"
      ? "CBSE Sample Papers"
      : division === "DPP"
      ? "Daily Practice Problems"
      : division === "BOARD_LEVEL_TEST"
      ? "Board Level Tests"
      : division === "CHAPTER_WISE_TEST"
      ? "Chapter Wise Tests"
      : division === "STUDY_PACKAGE"
      ? "Study Packages"
      : division === "SKILL_BUILDING"
      ? "Skill Building"
      : division === "CAREER_COUNSELING"
      ? "Career Counseling"
      : division
      ? division.replace(/_/g, " ")
      : "Opportunities";

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 pt-6 pb-14 sm:px-8 md:pt-8">
      <nav
        aria-label="Breadcrumb"
        className={`${s.crumbs} flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-(--hp-muted)`}
      >
        <Link href="/" className="inline-flex min-h-11 items-center">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-(--hp-ink)">{divisionTitle}</span>
      </nav>
      <h1 className={`${s.display} m-0 mt-1 mb-7 text-[36px] leading-[1.1] font-bold sm:text-[44px] md:text-[52px]`}>
        {divisionTitle}
      </h1>

      <p className={stepLabel}>1. Division</p>
      <div className="mb-7 flex flex-wrap gap-2">
        {Object.entries(DIVISION_ICONS).map(([key, meta]) => {
          const isActive = division === key || (!division && key === "TEST_SERIES");
          const href = key === "TEST_SERIES" ? "/opportunities" : `/opportunities?division=${key}`;
          return (
            <Link
              key={key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`${s.flat} inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[13px] font-extrabold text-(--hp-ink) no-underline ${
                isActive
                  ? `border-[3px] border-(--hp-ink) ${meta.bg} shadow-[3px_3px_0_var(--hp-ink)]`
                  : "border-2 border-(--hp-ink) bg-white hover:bg-(--hp-butter)"
              }`}
            >
              <meta.Icon size={16} stroke={2.4} aria-hidden="true" />
              {key.replace(/_/g, " ")}
            </Link>
          );
        })}
      </div>

      {classList.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <p className={stepLabel}>2. Class</p>
            {(selectedClass || categoryId || selectedChapter) && (
              <button onClick={resetToAllClasses} className={`${textButton} -mt-2`}>
                Reset
              </button>
            )}
          </div>

          {(selectedClass || categoryId || selectedChapter) && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-sm font-bold text-(--hp-muted)">
              <button onClick={resetToAllClasses} className={textButton}>
                All classes
              </button>
              {selectedClass && (
                <>
                  <span aria-hidden="true">›</span>
                  <button
                    onClick={() => selectClass(selectedClass)}
                    className={`${textButton} ${!categoryId ? "text-(--hp-ink)" : ""}`}
                  >
                    {selectedClass}
                  </button>
                </>
              )}
              {selectedSubjectName && (
                <>
                  <span aria-hidden="true">›</span>
                  <button
                    onClick={() => setSelectedChapter("")}
                    className={`${textButton} ${!selectedChapter ? "text-(--hp-ink)" : ""}`}
                  >
                    {selectedSubjectName}
                  </button>
                </>
              )}
              {selectedChapter && (
                <>
                  <span aria-hidden="true">›</span>
                  <span className="text-(--hp-ink)">Chapter {selectedChapter}</span>
                </>
              )}
            </div>
          )}

          <div className="mb-7 flex flex-wrap gap-2">
            <button
              onClick={resetToAllClasses}
              aria-pressed={!selectedClass}
              className={`${pillBase} ${!selectedClass ? pillOn : pillOff}`}
            >
              All classes
            </button>
            {classList.map((label) => (
              <button
                key={label}
                onClick={() => selectClass(label)}
                aria-pressed={selectedClass === label}
                className={`${pillBase} ${selectedClass === label ? pillOn : pillOff}`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedClass && classGroups[selectedClass] && (
        <>
          <p className={stepLabel}>3. Subject</p>
          <div className="mb-7 flex flex-wrap gap-2">
            {classGroups[selectedClass].map((c) => (
              <button
                key={c.id}
                onClick={() => selectSubject(c.id)}
                aria-pressed={categoryId === c.id}
                className={`${pillBase} ${categoryId === c.id ? pillOn : pillOff}`}
              >
                {c.subject}
              </button>
            ))}
          </div>
        </>
      )}

      {categoryId && chapterList.length > 0 && (
        <>
          <p className={stepLabel}>4. Chapter</p>
          <div className="mb-7 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedChapter("")}
              aria-pressed={!selectedChapter}
              className={`${pillBase} ${!selectedChapter ? pillOn : pillOff}`}
            >
              All chapters
            </button>
            {chapterList.map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChapter(String(ch))}
                aria-pressed={selectedChapter === String(ch)}
                className={`${pillBase} ${selectedChapter === String(ch) ? pillOn : pillOff}`}
              >
                Chapter {ch}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Search and filters */}
      <div className="mb-10 flex flex-col flex-wrap gap-3 rounded-[24px] border-[3px] border-(--hp-ink) bg-white p-4 shadow-[5px_5px_0_var(--hp-ink)] sm:flex-row sm:p-5">
        <div className="relative min-w-0 flex-1">
          <IconSearch
            size={20}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-(--hp-muted)"
          />
          <input
            type="text"
            placeholder="Search by title..."
            aria-label="Search by title"
            className={`${fieldClass} w-full pl-11`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Type"
          className={`${fieldClass} min-w-0 max-w-full sm:max-w-[170px]`}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
          ))}
        </select>
        <select
          aria-label="Category"
          className={`${fieldClass} min-w-0 max-w-full sm:max-w-[200px]`}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 rounded-[24px] border-[3px] border-(--hp-ink)/20 bg-white p-6">
              <Skeleton className="w-11 h-11 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && opportunities.length === 0 && (
        <p className="text-[17px] font-semibold text-(--hp-muted)">No opportunities found yet. Check back soon!</p>
      )}

      <div className="flex flex-col gap-6">
        {displayedOpportunities.map((op, i) => {
          const divisionStyle = DIVISION_ICONS[op.division] || DIVISION_ICONS.TEST_SERIES;
          const DivIcon = divisionStyle.Icon;
          return (
            <FadeIn key={op.id} delay={i * 60}>
              <Link href={`/opportunities/${op.id}`} className={`${s.press} [--radius:24px]`}>
                <span className={`${s.face} flex-col bg-white p-5 sm:p-6`}>
                  <span className="flex flex-wrap items-start justify-between gap-3">
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--hp-ink) ${divisionStyle.bg}`}
                      >
                        <DivIcon size={22} stroke={2} aria-hidden="true" />
                        {getShortLabel(op.category?.name) && (
                          <span className="absolute -right-1.5 -bottom-1.5 min-w-[18px] rounded-full border-2 border-(--hp-ink) bg-white px-1 text-center text-[9px] leading-[14px] font-extrabold">
                            {getShortLabel(op.category?.name)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className={`${s.display} text-xl leading-tight font-bold break-words`}>{op.title}</span>
                          {op.requiresCode && (
                            <span className="inline-flex items-center gap-1 rounded-full border-2 border-(--hp-ink) bg-(--hp-butter) px-2 py-0.5 text-[11px] font-extrabold">
                              <IconLock size={11} stroke={2.6} aria-hidden="true" />
                              Code required
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-[15px] font-semibold text-(--hp-muted)">
                          {op.company?.companyName} • {op.category?.name}
                          {op.chapter ? ` • Chapter ${op.chapter}` : ""}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${
                        op.type === "SOLUTION"
                          ? "bg-(--hp-lavender-soft) text-(--hp-purple-deep)"
                          : "bg-(--hp-mint-soft) text-[#14532d]"
                      }`}
                    >
                      {TYPE_LABELS[op.type] || op.type}
                    </span>
                  </span>
                  <span className="mt-3 block text-sm font-bold text-(--hp-muted)">
                    Apply by {new Date(op.applyDeadline).toLocaleDateString()}
                  </span>
                </span>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <div className={`${fredoka.variable} ${nunito.variable} ${s.page} flex-1`}>
      <Suspense
        fallback={<div className="flex flex-1 items-center justify-center py-20 font-bold text-(--hp-muted)">Loading...</div>}
      >
        <OpportunitiesContent />
      </Suspense>
    </div>
  );
}
