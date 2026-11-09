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
import {
  INTERNSHIPS_ROOT_SLUG,
  INTERNSHIPS_STAGE_SLUG,
  NON_POSTABLE_INTERNSHIP_SLUGS,
  getOpenInternshipsForSubcategory,
} from "@/lib/internships";
import ViewTracker from "@/components/ViewTracker";
import { SubjectArt } from "@/components/Illustrations";
import AdSlot from "@/components/home/AdSlot";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/school/school.module.css";

// Option B pastels (backgrounds only; text stays ink for contrast)
const PASTELS = [
  "bg-(--hp-lavender)",
  "bg-(--hp-sky)",
  "bg-(--hp-mint)",
  "bg-(--hp-coral)",
  "bg-(--hp-pink)",
  "bg-(--hp-yellow)",
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

function ComingSoon({ text }: { text: string }) {
  return (
    <div className="rounded-[28px] border-[3px] border-(--hp-ink) bg-white p-8 text-center sm:p-10">
      <svg viewBox="0 0 120 100" className="float-gentle mx-auto w-32 h-auto" aria-hidden="true">
        <circle cx="60" cy="52" r="40" fill="#EDE9FE" />
        <rect x="34" y="34" width="52" height="40" rx="5" fill="#5B33D6" />
        <rect x="39" y="39" width="42" height="30" rx="3" fill="#FFFFFF" />
        <rect x="45" y="46" width="30" height="4" rx="2" fill="#CFCCE3" />
        <rect x="45" y="55" width="22" height="4" rx="2" fill="#CFCCE3" />
        <path d="M92 20l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#F59E0B" />
        <circle cx="26" cy="30" r="4" fill="#FBCFE8" />
      </svg>
      <h3 className={`${s.display} mt-4 text-2xl font-bold`}>Coming Soon</h3>
      <p className="mx-auto mt-2 max-w-[42ch] text-base font-semibold text-(--hp-muted)">{text}</p>
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

  // Internship subcategory page: higher-education > LEVEL > internships > SUBJECT (not a guide page)
  const isInternshipPage =
    trail.length === 4 &&
    trail[0].kind === "COURSE" &&
    trail[0].slug === INTERNSHIPS_ROOT_SLUG &&
    trail[1].kind === "LEVEL" &&
    trail[2].kind === "STAGE" &&
    trail[2].slug === INTERNSHIPS_STAGE_SLUG &&
    trail[3].kind === "SUBJECT" &&
    !NON_POSTABLE_INTERNSHIP_SLUGS.includes(trail[3].slug);

  const internships = isInternshipPage ? await getOpenInternshipsForSubcategory(trail[3].slug) : [];

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
    <div className={`${fredoka.variable} ${nunito.variable} ${s.page} flex-1`}>
      {current && <ViewTracker courseNodeId={current.id} />}

      <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-8">
        <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-14 sm:px-8 md:pt-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className={`${s.crumbs} flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-(--hp-muted)`}
        >
          <Link href="/" className="inline-flex min-h-11 items-center">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/courses" className="inline-flex min-h-11 items-center">Courses</Link>
          {trail.map((n, i) => (
            <span key={n.id} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {i === trail.length - 1 && !activeSection ? (
                <span aria-current="page" className="text-(--hp-ink)">{n.name}</span>
              ) : (
                <Link href={"/courses/" + slug.slice(0, i + 1).join("/")} className="inline-flex min-h-11 items-center">
                  {n.name}
                </Link>
              )}
            </span>
          ))}
          {activeSection && (
            <span className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-(--hp-ink)">{activeSection.label}</span>
            </span>
          )}
        </nav>

        <h1 className={`${s.display} mt-2 text-[34px] leading-[1.12] font-bold sm:text-[42px] md:text-[52px]`}>
          {activeSection ? `${title}: ${activeSection.label}` : title}
        </h1>
        {current?.bookName && (
          <p className="mt-3 inline-flex rounded-full border-2 border-(--hp-ink) bg-(--hp-butter) px-4 py-1.5 text-[15px] font-bold">
            Book: {current.bookName}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-start gap-8">
          <div className="min-w-0 flex-1 basis-[300px] sm:basis-[480px]">
            {/* ---------- School class page: the 7 cards ---------- */}
            {isClassPage && !activeSection && (
              <div className="grid gap-5 sm:grid-cols-2">
                {CLASS_SECTIONS.map((sec, i) => (
                  <Link key={sec.slug} href={`${basePath}?section=${sec.slug}`} className={`${s.press} [--radius:24px]`}>
                    <span className={`${s.face} ${PASTELS[i % PASTELS.length]} flex-col p-6`}>
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-(--hp-ink) bg-white">
                        <sec.Icon size={26} stroke={2} aria-hidden="true" />
                      </span>
                      <span className={`${s.display} mt-4 block text-2xl font-bold`}>{sec.label}</span>
                      <span className="mt-1.5 block text-[15px] font-semibold">{sec.text}</span>
                      <span className="mt-4 inline-flex h-11 items-center self-start rounded-full bg-(--hp-ink) px-5 font-extrabold text-white">
                        Open →
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* ---------- School class page: a chosen card ---------- */}
            {isClassPage && activeSection && (
              <div>
                <Link
                  href={basePath}
                  className="inline-flex min-h-11 items-center text-[15px] font-extrabold text-(--hp-link) underline-offset-4 hover:underline"
                >
                  ← Back to {title}
                </Link>

                {activeSection.slug === "subjects" ? (
                  children.length === 0 ? (
                    <div className="mt-5">
                      <ComingSoon text="Subjects for this class are being added. Check back soon." />
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
                      {children.map((c, i) => (
                        <Link key={c.id} href={`${basePath}/${c.slug}`} className={`${s.press} [--radius:22px]`}>
                          <span className={`${s.face} ${PASTELS[i % PASTELS.length]} min-h-[120px] flex-col p-5`}>
                            <span className={`${s.display} block text-xl leading-tight font-bold break-words sm:text-[22px]`}>
                              {c.name}
                            </span>
                            <span className="mt-auto block pt-3 text-sm font-extrabold">Open →</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )
                ) : classPosts.length === 0 ? (
                  <div className="mt-5">
                    <ComingSoon text={`${activeSection.label} for ${title} are being added. Check back soon.`} />
                  </div>
                ) : (
                  <div className={`${s.listCard} mt-5`}>
                    {classPosts.map((p) => (
                      <Link key={p.id} href={`/opportunities/${p.id}`} className={s.row}>
                        <span className="min-w-0 break-words">{p.title}</span>
                        <span aria-hidden="true" className={s.rowArrow}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------- Chapter page: one section per content type ---------- */}
            {isChapter && (
              <div className="space-y-6">
                {contentTypes.map((t, i) => {
                  const posts = chapterPosts.filter((p) => p.contentType === t);
                  return (
                    <section key={t} className={s.listCard} aria-label={labelFor(t)}>
                      <div
                        className={`flex min-h-14 items-center justify-between gap-3 border-b-[3px] border-(--hp-ink) px-5 py-3 ${PASTELS[i % PASTELS.length]}`}
                      >
                        <h2 className={`${s.display} m-0 text-[22px] font-bold`}>{labelFor(t)}</h2>
                        {posts.length > 0 && (
                          <span className="inline-flex min-w-8 justify-center rounded-full border-2 border-(--hp-ink) bg-white px-2.5 py-0.5 text-sm font-extrabold">
                            {posts.length}
                          </span>
                        )}
                      </div>
                      {posts.length === 0 ? (
                        <p className="m-0 px-5 py-4 text-[15px] font-semibold text-(--hp-muted)">Coming soon</p>
                      ) : (
                        <div>
                          {posts.map((p) => (
                            <Link key={p.id} href={`/opportunities/${p.id}`} className={s.row}>
                              <span className="min-w-0 text-[17px] break-words">{p.title}</span>
                              <span aria-hidden="true" className={s.rowArrow}>→</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            {/* ---------- Chapters list ---------- */}
            {!isChapter && !isClassPage && chaptersMode && (
              <div className={s.listCard}>
                {children.map((c) => (
                  <Link key={c.id} href={`${basePath}/${c.slug}`} className={s.row}>
                    <span
                      className={`${s.display} flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-(--hp-ink) bg-(--hp-yellow) text-base font-bold`}
                    >
                      {c.chapterNo}
                    </span>
                    <span className="min-w-0 text-[17px] break-words">{c.name}</span>
                    <span aria-hidden="true" className={s.rowArrow}>→</span>
                  </Link>
                ))}
              </div>
            )}

            {/* ---------- Tiles for courses, stages, subjects ---------- */}
            {!isChapter && !isClassPage && !chaptersMode && children.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
                {children.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`${basePath === "/courses/" ? "/courses" : basePath}/${c.slug}`}
                    className={`${s.press} [--radius:22px]`}
                  >
                    <span className={`${s.face} ${PASTELS[i % PASTELS.length]} min-h-[120px] flex-col p-4 sm:p-5`}>
                      {isSchool && c.kind === "SUBJECT" && (
                        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-(--hp-ink) bg-white">
                          <SubjectArt name={c.name} className="h-9 w-9" />
                        </span>
                      )}
                      <span className={`${s.display} block text-xl leading-tight font-bold break-words sm:text-[22px]`}>
                        {c.name}
                      </span>
                      <span className="mt-auto block pt-3 text-sm font-extrabold">Open →</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {/* ---------- Internship subcategory: open internships ---------- */}
            {isInternshipPage &&
              (internships.length === 0 ? (
                <ComingSoon text={`Internships in ${title} are being added. Check back soon.`} />
              ) : (
                <div>
                  <p className="text-[15px] font-bold text-(--hp-muted)">
                    {internships.length} open internship{internships.length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    {internships.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/opportunities/${p.id}?level=${trail[1].slug}`}
                        className={`${s.press} [--radius:24px]`}
                      >
                        <span className={`${s.face} ${PASTELS[i % PASTELS.length]} flex-col p-5`}>
                          <span className={`${s.display} block text-xl leading-tight font-bold break-words`}>{p.title}</span>
                          <span className="mt-1 block text-[15px] font-semibold">{p.company.companyName}</span>
                          <span className="mt-3 flex flex-wrap gap-2 text-[13px] font-bold">
                            {p.duration && (
                              <span className="rounded-full border-2 border-(--hp-ink) bg-white px-2.5 py-0.5">⏱ {p.duration}</span>
                            )}
                            {p.stipendOrPrize && (
                              <span className="rounded-full border-2 border-(--hp-ink) bg-white px-2.5 py-0.5">₹ {p.stipendOrPrize}</span>
                            )}
                            <span className="rounded-full border-2 border-(--hp-ink) bg-white px-2.5 py-0.5">
                              📍 {p.location ? `${p.location} · ${p.mode}` : p.mode}
                            </span>
                          </span>
                          <span className="mt-3 block text-sm font-extrabold">
                            Apply by{" "}
                            {p.applyDeadline.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              timeZone: "Asia/Kolkata",
                            })}{" "}
                            →
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

            {/* ---------- Nothing here yet ---------- */}
            {!isChapter && !isClassPage && !isInternshipPage && children.length === 0 && (
              <ComingSoon text="Content for this section is being added. Check back soon." />
            )}
          </div>

          <div className="w-full shrink-0 sm:w-[300px]">
            <AdSlot label="300 × 250 box space" className="h-[250px] max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}