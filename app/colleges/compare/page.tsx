import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_COLLEGES } from "@/lib/features";
import { verifiedColleges } from "@/lib/colleges/data";
import { COMPARE_MAX, COMPARE_MIN, comparePath, parseCompare } from "@/lib/colleges/compare";
import { feeLines, NOT_AVAILABLE, place, years } from "@/lib/colleges/format";
import { formatDate } from "@/lib/abroad/format";
import type { CollegeView, CourseView, SourceRef } from "@/lib/colleges/types";
import { SITE_NAME } from "@/lib/site";
import CellSource from "@/components/colleges/CellSource";
import ExamNames from "@/components/colleges/ExamNames";
import s from "@/components/colleges/colleges.module.css";

// Read from the database on each request; only VERIFIED colleges and courses can be compared
export const dynamic = "force-dynamic";

// Compare pages are combinations of college pages, not content of their own: never indexed
export const metadata: Metadata = SHOW_COLLEGES
  ? {
      title: `Compare colleges | ${SITE_NAME}`,
      description: "Two or three colleges side by side, every fact with its official source and the date it was checked.",
      robots: { index: false, follow: true },
    }
  : {};

type Props = { searchParams: Promise<{ c?: string | string[] }> };

type Cell = { value: React.ReactNode; src: SourceRef | null };
type Row = { label: string; cell: (c: CollegeView) => Cell };

const has = (v: unknown) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);

// College rows, always in this order
const COLLEGE_ROWS: Row[] = [
  { label: "Type", cell: (c) => ({ value: c.type, src: c.src.approval }) },
  { label: "Established", cell: (c) => ({ value: c.establishedYear, src: c.src.approval }) },
  { label: "Location", cell: (c) => ({ value: place(c), src: c.src.basic }) },
  { label: "Approved by", cell: (c) => ({ value: c.approvedBy.join(", "), src: c.src.approval }) },
  {
    label: "NAAC",
    cell: (c) => ({
      value: c.naacGrade && `${c.naacGrade}${c.naacValidUntil ? ` (valid until ${formatDate(c.naacValidUntil)})` : ""}`,
      src: c.src.naac,
    }),
  },
  {
    label: "NIRF",
    cell: (c) => ({
      value:
        c.nirfRank &&
        `Rank ${c.nirfRank}${c.nirfCategory || c.nirfYear ? ` (${[c.nirfCategory, c.nirfYear].filter(Boolean).join(", ")})` : ""}`,
      src: c.src.nirf,
    }),
  },
  { label: "Hostel", cell: (c) => ({ value: c.hostel, src: c.src.facilities }) },
  {
    label: "Campus",
    cell: (c) => ({ value: c.campusAreaAcres && `${c.campusAreaAcres.toLocaleString("en-IN")} acres`, src: c.src.facilities }),
  },
];

// Course rows for one course_id; a college without that course shows "Not available yet" everywhere
const COURSE_ROWS: { label: string; cell: (k: CourseView) => Cell }[] = [
  {
    label: "Course",
    cell: (k) => ({
      value: (
        <>
          {k.name}
          {[k.specialization, k.level, k.mode].some(Boolean) && (
            <small className={s.cellSub}>{[k.specialization, k.level, k.mode].filter(Boolean).join(" · ")}</small>
          )}
        </>
      ),
      src: k.src.course,
    }),
  },
  { label: "Duration", cell: (k) => ({ value: k.durationYears && years(k.durationYears), src: k.src.course }) },
  { label: "Eligibility", cell: (k) => ({ value: k.eligibility, src: k.src.eligibility }) },
  {
    label: "Entrance exams",
    cell: (k) => ({ value: k.entranceExams.length ? <ExamNames exams={k.entranceExams} /> : null, src: k.src.exams }),
  },
  {
    // Exactly as stored, never worked out (a semester fee says "per semester (1st year)")
    label: "Fee",
    cell: (k) => {
      const fees = feeLines(k);
      return {
        value: fees.length
          ? fees.map((x) => (
              <span key={x.label} className={s.feeLine}>
                <b>{x.amount}</b>
                <small>
                  {x.label}
                  {k.feeYear ? `, ${k.feeYear}` : ""}
                </small>
              </span>
            ))
          : null,
        src: k.src.fee,
      };
    },
  },
];

const LEVELS = ["Certificate", "Diploma", "UG", "Integrated", "PG", "PhD"];
const rank = (l: string | null) => (l && LEVELS.includes(l) ? LEVELS.indexOf(l) : LEVELS.length);

/** Every course_id in any picked college, UG before PG; labelled by its shortest name among them */
function courseGroups(colleges: CollegeView[]) {
  const ids = new Map<string, CourseView[]>();
  for (const c of colleges) for (const k of c.courses) ids.set(k.courseId, [...(ids.get(k.courseId) ?? []), k]);
  return [...ids.entries()]
    .map(([id, list]) => ({
      id,
      label: list.map((k) => k.name).sort((a, b) => a.length - b.length)[0],
      level: Math.min(...list.map((k) => rank(k.level))),
    }))
    .sort((a, b) => a.level - b.level || a.label.localeCompare(b.label));
}

function Td({ cell, college }: { cell: Cell; college: CollegeView }) {
  const filled = has(cell.value);
  return (
    <td className={filled ? undefined : s.na}>
      {filled ? cell.value : NOT_AVAILABLE}
      {filled && <CellSource src={cell.src} college={college} />}
    </td>
  );
}

// Compare (radiant-design/college-pages.html style): 2–3 VERIFIED colleges side by side. Every value
// keeps its source and date; on phones only the table scrolls sideways, never the page.
export default async function ComparePage({ searchParams }: Props) {
  if (!SHOW_COLLEGES) notFound(); // also checked in the layout; this keeps the database untouched
  const wanted = parseCompare((await searchParams).c);
  const all = await verifiedColleges();
  const picked = wanted.map((slug) => all.find((c) => c.slug === slug)).filter((c): c is CollegeView => !!c);
  const slugs = picked.map((c) => c.slug);
  const others = all.filter((c) => !slugs.includes(c.slug));

  return (
    <div className={`${s.page} flex-1`}>
      <div className={`${s.wrap} ${s.phead}`}>
        <nav aria-label="Breadcrumb" className={s.crumbLight}>
          <Link href="/colleges">Colleges</Link> / <span aria-current="page">Compare</span>
        </nav>
        <h1 className={s.h1}>
          Compare <span className={s.ser}>side by side</span>
        </h1>
        <p className={s.lead}>
          Each value comes from the college&rsquo;s or regulator&rsquo;s official page, with the date we checked it. Fees
          are shown exactly as published, never worked out.
        </p>
      </div>

      <div className={`${s.wrap} ${s.cmpWrap}`}>
        {picked.length < COMPARE_MIN ? (
          <div className={`${s.card} ${s.sec}`}>
            <h2 className={s.h2}>
              Pick <span className={s.ser}>{COMPARE_MIN}–{COMPARE_MAX} colleges</span>
            </h2>
            {picked.length === 1 && <p>Selected: {picked[0].name}. Add one or two more:</p>}
            <ul className={s.pickList}>
              {others.map((c) => (
                <li key={c.slug}>
                  <Link className={`${s.btn} ${s.btnOut}`} href={comparePath([...slugs, c.slug])}>
                    + {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className={`${s.card} ${s.cmpScroll}`} role="region" aria-label="Comparison table" tabIndex={0}>
              <table className={s.cmpTab} style={{ ["--cols" as string]: picked.length }}>
                <thead>
                  <tr>
                    <td className={s.cmpCorner} />
                    {picked.map((c) => (
                      <th key={c.slug} scope="col">
                        <Link href={`/colleges/${c.slug}`}>{c.name}</Link>
                        {place(c) && <small className={s.cellSub}>{place(c)}</small>}
                        <Link className={s.cmpRemove} href={picked.length > 1 ? comparePath(slugs.filter((x) => x !== c.slug)) : "/colleges"}>
                          Remove<span className="sr-only"> {c.name}</span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COLLEGE_ROWS.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {picked.map((c) => (
                        <Td key={c.slug} cell={r.cell(c)} college={c} />
                      ))}
                    </tr>
                  ))}
                </tbody>
                {courseGroups(picked).map((g) => (
                  <tbody key={g.id}>
                    <tr className={s.cmpGroup}>
                      <th scope="colgroup" colSpan={picked.length + 1}>
                        <span>{g.label}</span>
                      </th>
                    </tr>
                    {COURSE_ROWS.map((r) => (
                      <tr key={r.label}>
                        <th scope="row">{r.label}</th>
                        {picked.map((c) => {
                          const k = c.courses.find((x) => x.courseId === g.id);
                          return k ? (
                            <Td key={c.slug} cell={r.cell(k)} college={c} />
                          ) : (
                            <td key={c.slug} className={s.na}>
                              {NOT_AVAILABLE}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            <p className={s.note}>
              Hostel is charged separately. Check each college&rsquo;s official fee page for what is included before you pay.
            </p>
            {picked.length < COMPARE_MAX && others.length > 0 && (
              <div className={s.cmpAdd}>
                <span>Add a college:</span>
                {others.map((c) => (
                  <Link key={c.slug} className={`${s.btn} ${s.btnOut}`} href={comparePath([...slugs, c.slug])}>
                    + {c.shortName ?? c.name}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
