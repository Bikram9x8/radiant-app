import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SHOW_COLLEGES, SHOW_SCHOOL, SHOW_UPDATES } from "@/lib/features";
import { verifiedColleges } from "@/lib/colleges/data";
import { collegesForExam, examPath, examsInUse } from "@/lib/colleges/exams";
import { notSchoolWhere } from "@/lib/school-posts";
import { endedTestWhere, entranceMeta, formatTestDate, postKindLabel, testPostWhere } from "@/lib/test-posts";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { daysLeft, deadlineLabel, linkText, postedBy, sourceLine, type UpdateView } from "@/lib/updates/format";
import s from "@/components/exams/exams.module.css";

// One exam-date update: the same content, rules and look as the Latest updates card (UpdateCard), with
// the hub's own styles. Importing UpdateCard would pull the updates stylesheet in here, and the build
// then merges the hub's CSS into the file the homepage and /updates load.
function ExamDateCard({ item }: { item: UpdateView }) {
  const left = daysLeft(item.deadline);
  const by = postedBy(item.sourceType);
  const meta = [item.dates, item.location, item.mode, item.forWho].filter(Boolean);
  return (
    <article className={s.item}>
      <div className={s.top}>
        <span className={s.chip}>{item.type}</span>
        <span className={`${s.deadline} ${left !== null && left <= 7 ? s.deadlineSoon : ""}`}>{deadlineLabel(item.deadline)}</span>
      </div>
      <h3 className={s.title}>{item.title}</h3>
      <p className={s.org}>{item.organisation}</p>
      <p className={s.line}>{item.oneLine}</p>
      {meta.length > 0 && <p className={s.meta}>{meta.join(" · ")}</p>}
      <div className={s.foot}>
        <a className={s.link} href={item.linkUrl} target="_blank" rel="noopener nofollow">
          {linkText(item.sourceType)} ↗<span className="sr-only">: {item.title} (opens in a new tab)</span>
        </a>
        {by && <span className={s.by}>{by}</span>}
      </div>
      <p className={s.src}>{sourceLine(item)}</p>
    </article>
  );
}

// Read on each request: colleges, exam-date updates and open tests change without a deploy
export const dynamic = "force-dynamic";

const TITLE = `Entrance exams: colleges by exam | ${SITE_NAME}`;
const DESCRIPTION =
  "Entrance exams after Class 12: which checked colleges accept JEE Main, CUET UG, CAT and more, the latest exam dates, and open practice tests.";

// The hub is built from the colleges' entrance exams, so it lives behind the Colleges switch
export const metadata: Metadata = SHOW_COLLEGES
  ? {
      title: TITLE,
      description: DESCRIPTION,
      alternates: { canonical: absoluteUrl("/exams") },
      openGraph: { type: "website", url: absoluteUrl("/exams"), title: TITLE, description: DESCRIPTION, siteName: SITE_NAME, locale: "en_IN" },
    }
  : {};

// How many open tests the hub lists (the Tests page has them all)
const TESTS_SHOWN = 6;

// Open tests, with the same rules as the Tests page: approved tests only, ended tests left out, and
// School posts left out while School Education is switched off. Soonest end date first.
async function openTests() {
  return prisma.opportunity.findMany({
    where: {
      status: "APPROVED",
      ...(SHOW_SCHOOL ? {} : notSchoolWhere),
      AND: [testPostWhere, { NOT: endedTestWhere() }],
    },
    select: {
      id: true,
      title: true,
      type: true,
      division: true,
      contentType: true,
      requiresCode: true,
      applyDeadline: true,
      category: { select: { name: true } },
    },
    orderBy: { applyDeadline: "asc" },
  });
}

// Latest updates of type "Exam date" (only while Latest updates is switched on)
async function examUpdates() {
  if (!SHOW_UPDATES) return [];
  const { openUpdates } = await import("@/lib/updates/data");
  return (await openUpdates()).filter((x) => x.type === "Exam date");
}

// Exams hub: entrance exams with the checked colleges that accept each one, exam-date updates and
// open practice tests. A section with nothing in it is not shown.
export default async function ExamsPage() {
  if (!SHOW_COLLEGES) notFound();
  const [colleges, updates, tests] = await Promise.all([verifiedColleges(), examUpdates(), openTests()]);
  const exams = examsInUse(colleges).map((e) => ({ ...e, colleges: collegesForExam(colleges, e.slug)?.list.length ?? 0 }));

  return (
    <div className={`${s.page} flex-1`}>
      <div className={`${s.wrap} ${s.phead}`}>
        <h1 className={s.h1}>
          Entrance <span className={s.ser}>exams</span>
        </h1>
        <p className={s.lead}>
          Which checked colleges accept each entrance exam, the latest exam dates and open practice tests. Every
          college&rsquo;s exam list comes from its official page.
        </p>
      </div>

      <div className={s.wrap}>
        {exams.length > 0 && (
          <section className={s.sec} aria-labelledby="exams-entrance">
            <div className={s.secHead}>
              <h2 id="exams-entrance" className={s.h2}>
                Colleges <span className={s.ser}>by exam</span>
              </h2>
              <Link className={s.more} href="/colleges">
                All colleges →
              </Link>
            </div>
            <ul className={s.exams}>
              {exams.map((e) => (
                <li key={e.slug}>
                  <Link className={s.exam} href={examPath(e.slug)}>
                    <h3 className={s.examName}>{e.name}</h3>
                    <p className={s.examCount}>
                      {e.colleges} checked {e.colleges === 1 ? "college accepts" : "colleges accept"} it
                    </p>
                    <span className={s.examGo} aria-hidden="true">
                      See colleges →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {updates.length > 0 && (
          <section className={s.sec} aria-labelledby="exams-dates">
            <div className={s.secHead}>
              <h2 id="exams-dates" className={s.h2}>
                Exam dates <span className={`${s.ser} ${s.serCoral}`}>& updates</span>
              </h2>
              <Link className={s.more} href="/updates?type=Exam+date">
                All exam updates →
              </Link>
            </div>
            <ul className={s.dates}>
              {updates.map((x) => (
                <li key={x.slug}>
                  <ExamDateCard item={x} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {tests.length > 0 && (
          <section className={s.sec} aria-labelledby="exams-tests">
            <div className={s.secHead}>
              <h2 id="exams-tests" className={s.h2}>
                Practice <span className={`${s.ser} ${s.serCoral}`}>tests</span>
              </h2>
              <Link className={s.more} href="/opportunities">
                All practice tests →
              </Link>
            </div>
            <ul className={s.tests}>
              {tests.slice(0, TESTS_SHOWN).map((t) => (
                <li key={t.id}>
                  <Link className={s.test} href={`/opportunities/${t.id}`}>
                    <span className={s.testMain}>
                      <span className={s.testTop}>
                        <span className={s.kind}>{postKindLabel(t)}</span>
                        {t.requiresCode && <span className={s.code}>Code</span>}
                      </span>
                      <span className={s.testTitle}>{t.title}</span>
                      <span className={s.testMeta}>{SHOW_SCHOOL ? t.category?.name : entranceMeta(t.category?.name)}</span>
                    </span>
                    <span className={s.testEnd}>Open till {formatTestDate(t.applyDeadline)}</span>
                    <span className={s.testGo} aria-hidden="true">
                      Start →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={s.bottom} />
      </div>
    </div>
  );
}
