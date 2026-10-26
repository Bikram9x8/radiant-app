import Link from "next/link";
import { notFound } from "next/navigation";
import type { CourseNode } from "@prisma/client";
import {
  IconBooks,
  IconNotebook,
  IconClipboardCheck,
  IconFileText,
  IconHelpCircle,
  IconHistory,
  IconBulb,
} from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import ViewTracker from "@/components/ViewTracker";

const PASTELS = [
  "pastel-purple",
  "pastel-blue",
  "pastel-mint",
  "pastel-peach",
  "pastel-pink",
  "pastel-yellow",
];

const SCHOOL_SLUGS = ["cbse", "icse"];

// Order of the six options on a school chapter page
const SCHOOL_CHAPTER_TYPES = ["NOTES", "SOLUTION", "MCQ_TEST", "TEST", "DPP", "PYQ"];

const CONTENT_LABELS: Record<string, string> = {
  NOTES: "Notes",
  SOLUTION: "Solutions",
  TEST: "Tests",
  MCQ_TEST: "MCQ Tests",
  PYQ: "PYQ",
  DPP: "DPP",
  MOCK_TEST: "Mock Tests",
  LESSON: "Lessons",
  VIDEO: "Videos",
};

const SCHOOL_LABELS: Record<string, string> = {
  SOLUTION: "NCERT Solutions",
  TEST: "Chapter Tests",
  PYQ: "PYQs",
};

// The 7 cards on a school class page
const CLASS_SECTIONS = [
  { slug: "subjects", label: "Subjects", text: "Browse every subject and its chapters.", type: null, Icon: IconBooks },
  { slug: "study-material", label: "Study Material", text: "Notes and reference material for the class.", type: "STUDY_MATERIAL", Icon: IconNotebook },
  { slug: "practice-tests", label: "Practice & Tests", text: "Practice sets and full-length tests.", type: "PRACTICE_TEST", Icon: IconClipboardCheck },
  { slug: "sample-papers", label: "Sample Papers", text: "Board-pattern sample papers with solutions.", type: "SAMPLE_PAPER", Icon: IconFileText },
  { slug: "important-questions", label: "Important Questions", text: "Questions most likely to be asked.", type: "IMPORTANT_QUESTIONS", Icon: IconHelpCircle },
  { slug: "previous-year-papers", label: "Previous Year Papers", text: "Past board papers to practise with.", type: "PREVIOUS_YEAR_PAPER", Icon: IconHistory },
  { slug: "revision-notes", label: "Revision Notes", text: "Quick notes for last-minute revision.", type: "REVISION_NOTES", Icon: IconBulb },
];

function AdSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`mx-auto w-full border border-dashed border-zinc-300 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Advertisement</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

function ComingSoon({ text }: { text: string }) {
  return (
    <div className="card p-8 sm:p-10 text-center">
      <svg viewBox="0 0 120 100" className="float-gentle mx-auto w-32 h-auto" aria-hidden="true">
        <circle cx="60" cy="52" r="40" fill="#EDE9FE" />
        <rect x="34" y="34" width="52" height="40" rx="5" fill="#5B33D6" />
        <rect x="39" y="39" width="42" height="30" rx="3" fill="#FFFFFF" />
        <rect x="45" y="46" width="30" height="4" rx="2" fill="#CFCCE3" />
        <rect x="45" y="55" width="22" height="4" rx="2" fill="#CFCCE3" />
        <path d="M92 20l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#F59E0B" />
        <circle cx="26" cy="30" r="4" fill="#FBCFE8" />
      </svg>
      <h3 className="mt-4 text-xl font-extrabold text-[#14142b]">Coming Soon</h3>
      <p className="mt-2 text-sm text-zinc-600">{text}</p>
    </div>
  );
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { slug = [] } = await params;
  const { section } = await searchParams;

  // Walk down the tree one slug at a time
  const trail: CourseNode[] = [];
  let parentId: string | null = null;
  for (const s of slug) {
    const node: CourseNode | null = await prisma.courseNode.findFirst({
      where: { parentId, slug: s, isActive: true },
    });
    if (!node) notFound();
    trail.push(node);
    parentId = node.id;
  }

  const current = trail.length > 0 ? trail[trail.length - 1] : null;
  const root = trail.length > 0 ? trail[0] : null;

  const children = await prisma.courseNode.findMany({
    where: { parentId: current ? current.id : null, isActive: true },
    orderBy: { position: "asc" },
  });

  const isSchool = !!root && SCHOOL_SLUGS.includes(root.slug);
  const isChapter = current?.kind === "CHAPTER";
  const isClassPage = false; // class pages go straight to subjects
  const activeSection = isClassPage ? CLASS_SECTIONS.find((s) => s.slug === section) : undefined;

  // Posts (solutions, tests...) linked to this chapter
  const chapterPosts =
    current && isChapter
      ? await prisma.opportunity.findMany({
          where: { courseNodeId: current.id, status: "APPROVED" },
          orderBy: { createdAt: "asc" },
          select: { id: true, title: true, contentType: true },
        })
      : [];

  // Posts linked to this class for one of the class cards (Sample Papers etc.)
  const classPosts =
    current && activeSection && activeSection.type
      ? await prisma.opportunity.findMany({
          where: { courseNodeId: current.id, contentType: activeSection.type, status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true },
        })
      : [];

  const basePath = "/courses/" + slug.join("/");
  const chaptersMode = children.length > 0 && children[0].kind === "CHAPTER";
  const title = current ? current.name : "All courses";

  const contentTypes = isSchool
    ? SCHOOL_CHAPTER_TYPES
    : root && root.contentTypes.length > 0
      ? root.contentTypes
      : ["NOTES", "SOLUTION", "TEST", "MCQ_TEST", "PYQ", "DPP"];

  const labelFor = (t: string) => (isSchool && SCHOOL_LABELS[t]) || CONTENT_LABELS[t] || t;

  return (
    <div className="flex-1 bg-white">
      {current && <ViewTracker courseNodeId={current.id} />}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <AdSlot label="728 × 90 banner space" className="max-w-[728px] h-[90px]" />
      </div>

      <div className="fade-up max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/courses" className="hover:underline">Courses</Link>
          {trail.map((n, i) => (
            <span key={n.id} className="flex items-center gap-2">
              <span>/</span>
              {i === trail.length - 1 && !activeSection ? (
                <span className="text-zinc-900 font-semibold">{n.name}</span>
              ) : (
                <Link href={"/courses/" + slug.slice(0, i + 1).join("/")} className="hover:underline">
                  {n.name}
                </Link>
              )}
            </span>
          ))}
          {activeSection && (
            <span className="flex items-center gap-2">
              <span>/</span>
              <span className="text-zinc-900 font-semibold">{activeSection.label}</span>
            </span>
          )}
        </nav>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14142b]">
          {activeSection ? `${title}: ${activeSection.label}` : title}
        </h1>
        {current?.bookName && <p className="mt-2 text-zinc-600">Book: {current.bookName}</p>}

        <div className="mt-8 flex flex-wrap gap-8 items-start">
          <div className="flex-1 basis-[300px] sm:basis-[480px] min-w-0">
            {/* ---------- School class page: the 7 cards ---------- */}
            {isClassPage && !activeSection && (
              <div className="grid gap-5 sm:grid-cols-2">
                {CLASS_SECTIONS.map((s, i) => (
                  <Link
                    key={s.slug}
                    href={`${basePath}?section=${s.slug}`}
                    className={`card-lift block p-6 ${PASTELS[i % PASTELS.length]}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center">
                      <s.Icon size={26} stroke={2} />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-[#14142b]">{s.label}</h3>
                    <p className="mt-1.5 text-sm text-zinc-700">{s.text}</p>
                    <span className="btn btn-primary mt-4" style={{ padding: "0.5rem 1.1rem" }}>
                      Open →
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* ---------- School class page: a chosen card ---------- */}
            {isClassPage && activeSection && (
              <div>
                <Link href={basePath} className="text-sm font-bold text-[#5b33d6] hover:underline">
                  ← Back to {title}
                </Link>

                {activeSection.slug === "subjects" ? (
                  children.length === 0 ? (
                    <div className="mt-5">
                      <ComingSoon text="Subjects for this class are being added. Check back soon." />
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {children.map((c, i) => (
                        <Link
                          key={c.id}
                          href={`${basePath}/${c.slug}`}
                          className={`card-lift block p-5 ${PASTELS[i % PASTELS.length]}`}
                        >
                          <span className="block text-lg sm:text-xl font-extrabold text-[#14142b] break-words">{c.name}</span>
                          <span className="block mt-3 text-sm font-bold">Open →</span>
                        </Link>
                      ))}
                    </div>
                  )
                ) : classPosts.length === 0 ? (
                  <div className="mt-5">
                    <ComingSoon text={`${activeSection.label} for ${title} are being added. Check back soon.`} />
                  </div>
                ) : (
                  <div className="card mt-5 overflow-hidden divide-y divide-zinc-200">
                    {classPosts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/opportunities/${p.id}`}
                        className="block px-5 py-4 bg-white hover:bg-zinc-50 text-base font-semibold text-[#14142b]"
                      >
                        {p.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------- Chapter page: one section per content type ---------- */}
            {isChapter && (
              <div className="space-y-5">
                {contentTypes.map((t, i) => {
                  const posts = chapterPosts.filter((p) => p.contentType === t);
                  return (
                    <div key={t} className="card overflow-hidden">
                      <div className={`px-5 py-3 flex items-center justify-between ${PASTELS[i % PASTELS.length]}`}>
                        <span className="text-lg font-extrabold text-[#14142b]">{labelFor(t)}</span>
                        <span className="text-sm font-bold">{posts.length > 0 ? posts.length : ""}</span>
                      </div>
                      {posts.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-zinc-500">Coming soon</p>
                      ) : (
                        <div className="divide-y divide-zinc-200">
                          {posts.map((p) => (
                            <Link
                              key={p.id}
                              href={`/opportunities/${p.id}`}
                              className="block px-5 py-4 bg-white hover:bg-zinc-50 text-base font-semibold text-[#14142b]"
                            >
                              {p.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------- Chapters list ---------- */}
            {!isChapter && !isClassPage && chaptersMode && (
              <div className="card overflow-hidden divide-y divide-zinc-200">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    href={`${basePath}/${c.slug}`}
                    className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-zinc-50"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm">
                      {c.chapterNo}
                    </span>
                    <span className="text-base font-semibold text-[#14142b]">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* ---------- Tiles for courses, stages, subjects ---------- */}
            {!isChapter && !isClassPage && !chaptersMode && children.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {children.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`${basePath === "/courses/" ? "/courses" : basePath}/${c.slug}`}
                    className={`card-lift block p-5 ${PASTELS[i % PASTELS.length]}`}
                  >
                    <span className="block text-lg sm:text-xl font-extrabold text-[#14142b] break-words">{c.name}</span>
                    <span className="block mt-3 text-sm font-bold">Open →</span>
                  </Link>
                ))}
              </div>
            )}

            {/* ---------- Nothing here yet ---------- */}
            {!isChapter && !isClassPage && children.length === 0 && (
              <ComingSoon text="Content for this section is being added. Check back soon." />
            )}
          </div>

          <div className="shrink-0 w-full sm:w-[300px]">
            <AdSlot label="300 × 250 box space" className="max-w-full h-[250px]" />
          </div>
        </div>
      </div>
    </div>
  );
}