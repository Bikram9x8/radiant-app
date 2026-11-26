"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import s from "./landing.module.css";
import { usePrefersReducedMotion } from "@/components/brand/usePrefersReducedMotion";
import type { CollegeView } from "@/lib/colleges/types";
import { feeLines, place } from "@/lib/colleges/format";
import { courseGroups } from "@/lib/colleges/courses";
import { examSlug, examsInUse } from "@/lib/colleges/exams";

// The hero's college finder while SHOW_COLLEGES is on (app/page.tsx loads it only then; with the switch
// off the hero keeps the sample AdmissionPass). Same ticket design, real data: VERIFIED colleges and
// courses only. Course, state and exam choices come from that data, the count is the number of matching
// colleges, and "Show N colleges" opens /colleges with the same filters. A fee is shown exactly as stored
// (first published fee line of the chosen course), otherwise "Fee: see college page". Nothing is worked out.

const ANY = "";
const TINTS = ["var(--tint-teal)", "var(--tint-mint)", "var(--tint-sand)"];

// Barcode bars as [x, width], laid out once (same as AdmissionPass)
const BARS = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2].reduce<
  [number, number][]
>((acc, w, i) => {
  const prev = acc[i - 1];
  acc.push([prev ? prev[0] + prev[1] + (i % 3 === 0 ? 3 : 2) : 0, w]);
  return acc;
}, []);

function Barcode() {
  return (
    <svg viewBox="0 0 140 34" aria-hidden="true" focusable="false">
      {BARS.map(([x, w]) => (
        <rect key={x} x={x} y={0} width={w} height={34} fill="var(--ink)" />
      ))}
    </svg>
  );
}

/** "PU" from the short name, else the first letters of the first two words: "Chitkara University" -> "CU" */
function initials(c: CollegeView) {
  if (c.shortName && c.shortName.length <= 4) return c.shortName.toUpperCase();
  const words = c.name.replace(/\(.*?\)/g, "").split(/[\s,]+/).filter((w) => /^[A-Za-z]/.test(w) && !/^(of|and|the|for|university|college|institute)$/i.test(w));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

export default function CollegeFinderPass({ colleges }: { colleges: CollegeView[] }) {
  const id = useId();
  const reduceMotion = usePrefersReducedMotion();
  const passRef = useRef<HTMLDivElement>(null);
  const perfRef = useRef<HTMLDivElement>(null);
  const [course, setCourse] = useState(ANY);
  const [state, setState] = useState(ANY);
  const [exam, setExam] = useState(ANY);

  const courses = courseGroups(colleges);
  const states = [...new Set(colleges.map((c) => c.state).filter((v): v is string => !!v))].sort();
  const exams = examsInUse(colleges);

  const matches = colleges.filter(
    (c) =>
      (!state || c.state === state) &&
      (!(course || exam) ||
        c.courses.some((k) => (!course || k.courseId === course) && (!exam || k.entranceExams.some((e) => examSlug(e) === exam)))),
  );
  const target = matches.length;
  const [shown, setShown] = useState(target);

  const query = new URLSearchParams(Object.entries({ state, course, exam }).filter(([, v]) => v)).toString();
  const href = `/colleges${query ? `?${query}` : ""}`;

  // The side notches sit on the dashed tear line, wherever it ends up
  useLayoutEffect(() => {
    const pass = passRef.current;
    const perf = perfRef.current;
    if (!pass || !perf) return;
    const fit = () =>
      pass.style.setProperty("--notch", `${perf.getBoundingClientRect().top - pass.getBoundingClientRect().top}px`);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(pass);
    return () => ro.disconnect();
  }, []);

  // The number counts to the new total (instant with reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const from = shown;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 600);
      setShown(Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // Only a new target starts a new count; `shown` is read once as the starting point
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduceMotion]);

  const count = reduceMotion ? target : shown;
  const fields = [
    { key: "course", label: "Course", value: course, set: setCourse, all: "Any course", options: courses.map((g) => ({ value: g.id, label: g.label })) },
    { key: "state", label: "State", value: state, set: setState, all: "Any state", options: states.map((v) => ({ value: v, label: v })) },
    { key: "exam", label: "Entrance", value: exam, set: setExam, all: "Any exam", options: exams.map((e) => ({ value: e.slug, label: e.name })) },
  ];

  // The ticket tilts a little towards the mouse (pointer devices only, never with reduced motion)
  function onTilt(e: React.MouseEvent<HTMLDivElement>) {
    const pass = passRef.current;
    if (!pass || reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    pass.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }

  function resetTilt() {
    if (passRef.current) passRef.current.style.transform = "";
  }

  return (
    <div className={s.passWrap} onMouseMove={onTilt} onMouseLeave={resetTilt}>
      {/* Paper plane taking off from the ticket (bobs twice, then rests) */}
      <svg className={s.plane} viewBox="-40 -18 64 38" aria-hidden="true" focusable="false">
        <g className={s.planeFly}>
          <circle cx="-24" cy="10" r="2" fill="#94a3b8" />
          <circle cx="-33" cy="14" r="1.6" fill="#cbd5e1" />
          <g transform="rotate(-18)">
            <polygon points="21,0 -16,-13 -6,0" fill="#fff" stroke="#0f766e" strokeWidth="1.6" strokeLinejoin="round" />
            <polygon points="21,0 -6,0 -11,13" fill="#f97350" stroke="#0f766e" strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        </g>
      </svg>

      <section ref={passRef} className={s.pass} aria-labelledby={`${id}-title`}>
        <div className={s.stamp} aria-hidden="true">
          ADMIT<small>FREE · 2027</small>
        </div>
        <div className={s.passTop}>
          <span>RADIANT · ADMISSION PASS</span>
          <span className={s.sampleMark}>VERIFIED</span>
        </div>

        <div className={s.passBody}>
          <h2 id={`${id}-title`} className={s.passTitle}>
            College finder
          </h2>
          <form className={s.fields} onSubmit={(e) => e.preventDefault()}>
            {fields.map((f) => (
              <div key={f.key} className={s.field}>
                <label htmlFor={`${id}-${f.key}`}>{f.label}</label>
                <select id={`${id}-${f.key}`} value={f.value} onChange={(e) => f.set(e.target.value)}>
                  <option value={ANY}>{f.all}</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </form>

          <Link href={href} className={`${s.btn} ${s.dark} ${s.findBtn}`}>
            Show {count} {count === 1 ? "college" : "colleges"}
          </Link>
          {/* Screen readers hear the final number once, not every step of the count */}
          <p className="sr-only" aria-live="polite">
            {target} {target === 1 ? "college matches" : "colleges match"}.
          </p>

          <div ref={perfRef} className={s.perf} />
          <ul className={s.results} aria-label="Matching colleges">
            {matches.length === 0 && (
              <li className={s.result}>
                <div>
                  <b>No checked college matches yet</b>
                  <small>Try another course, state or exam.</small>
                </div>
              </li>
            )}
            {matches.slice(0, 3).map((c, i) => {
              const k = course ? c.courses.find((x) => x.courseId === course) : undefined;
              const fee = k ? feeLines(k)[0] : undefined;
              return (
                // A new key per choice re-creates the rows, so they rise in again
                <li key={`${c.slug}-${course}-${state}-${exam}`} className={s.result}>
                  <span className={s.ini} style={{ background: TINTS[i % TINTS.length] }} aria-hidden="true">
                    {initials(c)}
                  </span>
                  <div>
                    <b>
                      {/* Inline style: landing.module.css stays unchanged, so the homepage is identical while off */}
                      <Link href={`/colleges/${c.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {c.name}
                      </Link>
                    </b>
                    <small>{[place(c), c.type].filter(Boolean).join(" · ")}</small>
                  </div>
                  {/* Without a fee the text may wrap, so it doesn't squeeze the college name on phones */}
                  <div className={s.fee} style={fee ? undefined : { whiteSpace: "normal", maxWidth: "7.5em", fontSize: "13px" }}>
                    {fee ? fee.amount : "Fee: see college page"}
                    {fee && <em>{`${fee.label}${k?.feeYear ? `, ${k.feeYear}` : ""}`}</em>}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={s.passFoot}>
            <p className={s.sample}>Only colleges we checked on official pages. Fees exactly as each college publishes them.</p>
            <span className={s.barcode}>
              <Barcode />
              <span className={s.scan} aria-hidden="true" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
