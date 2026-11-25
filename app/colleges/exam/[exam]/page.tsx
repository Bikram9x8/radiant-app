import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_COLLEGES } from "@/lib/features";
import { verifiedColleges } from "@/lib/colleges/data";
import { collegesForExam, examPath } from "@/lib/colleges/exams";
import { NOT_AVAILABLE, place, years } from "@/lib/colleges/format";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import ExamNames from "@/components/colleges/ExamNames";
import SourceList from "@/components/colleges/SourceList";
import s from "@/components/colleges/colleges.module.css";

// Read from the database on each request; an exam no verified course accepts is a 404
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ exam: string }> };

async function load(slug: string) {
  const found = collegesForExam(await verifiedColleges(), slug);
  return found && found.list.length > 0 ? found : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_COLLEGES) return {};
  const { exam } = await params;
  const found = await load(exam);
  if (!found) return { title: `Exam not found | ${SITE_NAME}`, robots: { index: false } };
  const url = absoluteUrl(examPath(exam));
  const title = `Colleges that accept ${found.name} | ${SITE_NAME}`;
  const description = `Colleges and courses that take ${found.name} for admission, each from the college's official page with the date it was checked.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName: SITE_NAME, locale: "en_IN" },
  };
}

// Colleges by entrance exam: every VERIFIED college with the VERIFIED courses that list this exam,
// each with the official page the exam list comes from.
export default async function ExamPage({ params }: Props) {
  if (!SHOW_COLLEGES) notFound();
  const { exam } = await params;
  const found = await load(exam);
  if (!found) notFound();
  const courses = found.list.reduce((n, x) => n + x.courses.length, 0);

  return (
    <div className={`${s.page} flex-1`}>
      <div className={`${s.wrap} ${s.phead}`}>
        <nav aria-label="Breadcrumb" className={s.crumbLight}>
          <Link href="/colleges">Colleges</Link> / <span aria-current="page">{found.name}</span>
        </nav>
        <h1 className={s.h1}>
          {found.name} <span className={s.ser}>colleges</span>
        </h1>
        <p className={s.lead}>
          {/* One string: separate text pieces around {found.name} lost their space in the build */}
          {`${found.list.length} ${found.list.length === 1 ? "college" : "colleges"} with ${courses} ${courses === 1 ? "course" : "courses"} that take ${found.name} for admission. `}
          Each list of entrance exams comes from the college&rsquo;s official page; check the dates and cut-offs there
          before you apply.
        </p>
      </div>

      <div className={s.wrap}>
        <ul className={`${s.results} ${s.examList}`}>
          {found.list.map(({ college: c, courses: ks }) => (
            <li key={c.slug} className={`${s.card} ${s.sec}`}>
              <h2 className={s.rcTitle}>
                <Link href={`/colleges/${c.slug}`}>{c.name}</Link>
              </h2>
              {place(c) && <p className={s.meta}>{place(c)}</p>}
              <table className={s.ctab}>
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Entrance exams</th>
                  </tr>
                </thead>
                <tbody>
                  {ks.map((k) => (
                    <tr key={k.courseId}>
                      <th scope="row" data-l="Course">
                        <b>{k.name}</b>
                        {[k.specialization, k.level].some(Boolean) && (
                          <small>{[k.specialization, k.level].filter(Boolean).join(" · ")}</small>
                        )}
                      </th>
                      <td data-l="Duration" className={k.durationYears ? undefined : s.na}>
                        {k.durationYears ? years(k.durationYears) : NOT_AVAILABLE}
                      </td>
                      <td data-l="Entrance exams">
                        <ExamNames exams={k.entranceExams} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <SourceList
                college={c}
                items={ks.flatMap((k) => {
                  // The course name only when this college has more than one course here. Labels start
                  // with a fixed word: SourceList lower-cases the first letter of later labels.
                  const of = ks.length > 1 ? ` (${k.name})` : "";
                  return [
                    { label: `Entrance exams${of}`, src: k.src.exams },
                    { label: `Duration${of}`, src: k.durationYears ? k.src.course : null },
                  ];
                })}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
