"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { COMPARE_MAX, COMPARE_MIN, comparePath } from "@/lib/colleges/compare";
import type { CollegeView } from "@/lib/colleges/types";
import { COURSES_SOON, place } from "@/lib/colleges/format";
import { factSources } from "@/lib/colleges/fact-sources";
import { courseGroups } from "@/lib/colleges/courses";
import { examSlug, examsInUse } from "@/lib/colleges/exams";
import SourceList from "./SourceList";
import s from "./colleges.module.css";

type Filters = { state: string; type: string; stream: string; level: string; course: string; exam: string };
const ANY = "";
const EMPTY: Filters = { state: ANY, type: ANY, stream: ANY, level: ANY, course: ANY, exam: ANY };
type Opt = { value: string; label: string };
const plain = (values: string[]): Opt[] => values.map((v) => ({ value: v, label: v }));

const options = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => !!v))].sort();

// Filters work on the verified data already on the page (no request per change).
// Stream, level, course and entrance exam match when one course of the college has all the chosen ones.
// Course (course_id) and exam (exam page slug) can be preset from the URL (?course=bca&exam=jee-main).
export default function CollegeFinder({
  colleges,
  initialState = ANY,
  initialCompare = [],
  initialCourse = ANY,
  initialExam = ANY,
}: {
  colleges: CollegeView[];
  initialState?: string;
  initialCompare?: string[];
  initialCourse?: string;
  initialExam?: string;
}) {
  const [f, setF] = useState<Filters>({ ...EMPTY, state: initialState, course: initialCourse, exam: initialExam });
  // Colleges picked to compare: kept in the URL (?compare=a,b) only, so a reload or shared link keeps them
  const [picked, setPicked] = useState<string[]>(initialCompare);
  const savePicked = (next: string[]) => {
    setPicked(next);
    const url = new URL(window.location.href);
    if (next.length) url.searchParams.set("compare", next.join(","));
    else url.searchParams.delete("compare");
    window.history.replaceState(null, "", url.pathname + url.search);
  };
  const togglePick = (slug: string) =>
    savePicked(picked.includes(slug) ? picked.filter((x) => x !== slug) : [...picked, slug].slice(0, COMPARE_MAX));
  const pickedNames = picked.map((slug) => {
    const c = colleges.find((x) => x.slug === slug);
    return c ? (c.shortName ?? c.name) : null;
  });

  const opts = useMemo(
    (): Record<keyof Filters, Opt[]> => ({
      state: plain(options(colleges.map((c) => c.state))),
      type: plain(options(colleges.map((c) => c.type))),
      stream: plain(options(colleges.flatMap((c) => c.courses.map((k) => k.stream)))),
      level: plain(options(colleges.flatMap((c) => c.courses.map((k) => k.level)))),
      course: courseGroups(colleges).map((g) => ({ value: g.id, label: g.label })),
      exam: examsInUse(colleges).map((e) => ({ value: e.slug, label: e.name })),
    }),
    [colleges],
  );

  const courseFilters = f.stream || f.level || f.course || f.exam;
  const shown = colleges.filter(
    (c) =>
      (!f.state || c.state === f.state) &&
      (!f.type || c.type === f.type) &&
      (!courseFilters ||
        c.courses.some(
          (k) =>
            (!f.stream || k.stream === f.stream) &&
            (!f.level || k.level === f.level) &&
            (!f.course || k.courseId === f.course) &&
            (!f.exam || k.entranceExams.some((e) => examSlug(e) === f.exam)),
        )),
  );
  const active = Object.values(f).some(Boolean);

  const select = (key: keyof Filters, label: string, all: string) => (
    <div className={s.fl}>
      <label htmlFor={`f-${key}`}>{label}</label>
      <select id={`f-${key}`} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })}>
        <option value={ANY}>{all}</option>
        {opts[key].map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={`${s.wrap} ${s.fgrid}`}>
      <aside className={`${s.card} ${s.filters}`} aria-label="Filters">
        <h2 className={s.filtersTitle}>Filters</h2>
        {select("state", "State", "All states")}
        {select("type", "College type", "All types")}
        {select("stream", "Stream", "All streams")}
        {select("level", "Level", "All levels")}
        {select("course", "Course", "All courses")}
        {select("exam", "Entrance exam", "Any exam")}
        <button type="button" className={`${s.btn} ${s.btnOut} ${s.clear}`} onClick={() => setF(EMPTY)} disabled={!active}>
          Clear filters
        </button>
      </aside>

      <div>
        <p className={s.count} aria-live="polite">
          {shown.length} {shown.length === 1 ? "college" : "colleges"}
        </p>
        {shown.length === 0 ? (
          <div className={`${s.card} ${s.empty}`}>
            <h3>No colleges match these filters</h3>
            <p>Try another state or stream.</p>
            <button type="button" className={`${s.btn} ${s.btnPri}`} onClick={() => setF(EMPTY)}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul className={s.results}>
            {shown.map((c) => {
              const levels = options(c.courses.map((k) => k.level));
              const streams = options(c.courses.map((k) => k.stream));
              const meta = [place(c), c.type, c.establishedYear ? `Est. ${c.establishedYear}` : null].filter(Boolean);
              return (
                <li key={c.slug} className={`${s.card} ${s.rc}`}>
                  <div>
                    <h3 className={s.rcTitle}>
                      <Link href={`/colleges/${c.slug}`}>{c.name}</Link>
                    </h3>
                    {meta.length > 0 && <p className={s.meta}>{meta.join(" · ")}</p>}
                    <div className={s.tags}>
                      {c.naacGrade && <span className={`${s.chip} ${s.chipC}`}>NAAC {c.naacGrade}</span>}
                      {c.approvedBy.map((a) => (
                        <span key={a} className={`${s.chip} ${s.chipG}`}>
                          {a} approved
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* No verified course yet: a muted line, never a "0" stat */}
                  {c.courses.length === 0 ? (
                    <p className={s.soon}>{COURSES_SOON}</p>
                  ) : (
                    <dl className={s.kf}>
                      <div>
                        <dt>Courses</dt>
                        <dd>{c.courses.length}</dd>
                      </div>
                      {levels.length > 0 && (
                        <div>
                          <dt>Levels</dt>
                          <dd>{levels.join(", ")}</dd>
                        </div>
                      )}
                      {streams.length > 0 && (
                        <div className={s.kfWide}>
                          <dt>Streams</dt>
                          <dd>{streams.join(", ")}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <div className={s.act}>
                    <Link className={`${s.btn} ${s.btnDark}`} href={`/colleges/${c.slug}`}>
                      View college<span className="sr-only">: {c.name}</span>
                    </Link>
                    <label className={s.pick}>
                      <input
                        type="checkbox"
                        checked={picked.includes(c.slug)}
                        disabled={!picked.includes(c.slug) && picked.length >= COMPARE_MAX}
                        onChange={() => togglePick(c.slug)}
                      />
                      Compare<span className="sr-only"> {c.name}</span>
                    </label>
                    <SourceList
                      className={s.rcSources}
                      college={c}
                      items={factSources(c, ["type", "year", "approval", "naac", "location"])}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {picked.length > 0 && (
        <div className={s.cmpBar} role="region" aria-label="Compare">
          <p aria-live="polite">
            <b>
              Compare {picked.length}/{COMPARE_MAX}
            </b>
            <span>{pickedNames.filter(Boolean).join(", ")}</span>
          </p>
          <div className={s.cmpBarAct}>
            <button type="button" className={`${s.btn} ${s.btnOutDark}`} onClick={() => savePicked([])}>
              Clear
            </button>
            {picked.length >= COMPARE_MIN ? (
              <Link className={`${s.btn} ${s.btnPri}`} href={comparePath(picked)}>
                Compare now
              </Link>
            ) : (
              <span className={s.cmpHint}>Pick {COMPARE_MIN - picked.length} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
