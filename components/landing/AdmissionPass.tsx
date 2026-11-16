"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import s from "./landing.module.css";
import { usePrefersReducedMotion } from "@/components/brand/usePrefersReducedMotion";

// SAMPLE DATA for the design only: there is no college database yet. The ticket header and the
// footnote say so, and "Show colleges" goes to the real Higher Education pages.
const COURSES = ["B.Tech", "MBBS", "BCA", "B.Com", "BBA", "B.Sc"] as const;
const STATES = ["Punjab", "Chandigarh", "Haryana", "Delhi", "All India"] as const;
const ENTRANCES = ["JEE Main", "State exam", "No exam"] as const;
const COUNT: Record<string, number> = { "B.Tech": 128, MBBS: 24, BCA: 96, "B.Com": 142, BBA: 88, "B.Sc": 110 };
const STATE_FACTOR: Record<string, number> = { "All India": 9, Chandigarh: 0.4 };

const RESULTS = [
  { ini: "NI", name: "Northfield Institute of Technology", place: "Mohali, Punjab · Private", fee: "₹1.4L / yr", bg: "var(--tint-teal)" },
  { ini: "GC", name: "Greenvale Government College", place: "Chandigarh · Government", fee: "₹38K / yr", bg: "var(--tint-mint)" },
  { ini: "SU", name: "Sunrise University", place: "Ludhiana, Punjab · Private", fee: "₹1.1L / yr", bg: "var(--tint-sand)" },
];

// Barcode bars as [x, width], laid out once
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

function sampleCount(course: string, state: string) {
  return Math.round((COUNT[course] ?? 60) * (STATE_FACTOR[state] ?? 1));
}

export default function AdmissionPass() {
  const id = useId();
  const reduceMotion = usePrefersReducedMotion();
  const passRef = useRef<HTMLDivElement>(null);
  const perfRef = useRef<HTMLDivElement>(null);
  const [course, setCourse] = useState<string>(COURSES[0]);
  const [state, setState] = useState<string>(STATES[0]);
  const [entrance, setEntrance] = useState<string>(ENTRANCES[0]);
  const target = sampleCount(course, state);
  const [shown, setShown] = useState(target);

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
  const exam = entrance === "No exam" ? "Merit" : entrance;
  const fields = [
    { key: "course", label: "Course", value: course, set: setCourse, options: COURSES },
    { key: "state", label: "State", value: state, set: setState, options: STATES },
    { key: "entrance", label: "Entrance", value: entrance, set: setEntrance, options: ENTRANCES },
  ];

  return (
    <div className={s.passWrap}>
      {/* Paper plane taking off from the ticket */}
      <svg className={s.plane} viewBox="-40 -18 64 38" aria-hidden="true" focusable="false">
        <circle cx="-24" cy="10" r="2" fill="#94a3b8" />
        <circle cx="-33" cy="14" r="1.6" fill="#cbd5e1" />
        <g transform="rotate(-18)">
          <polygon points="21,0 -16,-13 -6,0" fill="#fff" stroke="#0f766e" strokeWidth="1.6" strokeLinejoin="round" />
          <polygon points="21,0 -6,0 -11,13" fill="#f97350" stroke="#0f766e" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      </svg>

      <section ref={passRef} className={s.pass} aria-labelledby={`${id}-title`}>
        <div className={s.stamp} aria-hidden="true">
          ADMIT<small>FREE · 2027</small>
        </div>
        <div className={s.passTop}>
          <span>RADIANT · ADMISSION PASS</span>
          <span className={s.sampleMark}>SAMPLE DATA</span>
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
                  {f.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </form>

          <Link href="/higher" className={`${s.btn} ${s.dark} ${s.findBtn}`}>
            Show {count} colleges
          </Link>
          {/* Screen readers hear the final number once, not every step of the count */}
          <p className="sr-only" aria-live="polite">
            Sample: {target} {course} colleges in {state}.
          </p>

          <div ref={perfRef} className={s.perf} />
          <ul className={s.results} aria-label="Sample results">
            {RESULTS.map((r) => (
              <li key={r.ini} className={s.result}>
                <span className={s.ini} style={{ background: r.bg }} aria-hidden="true">
                  {r.ini}
                </span>
                <div>
                  <b>{r.name}</b>
                  <small>{r.place}</small>
                </div>
                <div className={s.fee}>
                  {r.fee}
                  <em>{exam}</em>
                </div>
              </li>
            ))}
          </ul>

          <div className={s.passFoot}>
            <p className={s.sample}>Sample colleges and numbers, to show how the finder will work.</p>
            <span className={s.barcode}>
              <Barcode />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
