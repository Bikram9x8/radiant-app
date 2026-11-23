"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CollegeView } from "@/lib/colleges/types";
import { place } from "@/lib/colleges/format";
import { factSources } from "@/lib/colleges/fact-sources";
import SourceList from "./SourceList";
import s from "./colleges.module.css";

type Filters = { state: string; type: string; stream: string; level: string };
const ANY = "";
const EMPTY: Filters = { state: ANY, type: ANY, stream: ANY, level: ANY };

const options = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => !!v))].sort();

// Filters work on the verified data already on the page (no request per change).
// Stream and level match when one course of the college has both.
export default function CollegeFinder({ colleges }: { colleges: CollegeView[] }) {
  const [f, setF] = useState<Filters>(EMPTY);

  const opts = useMemo(
    () => ({
      state: options(colleges.map((c) => c.state)),
      type: options(colleges.map((c) => c.type)),
      stream: options(colleges.flatMap((c) => c.courses.map((k) => k.stream))),
      level: options(colleges.flatMap((c) => c.courses.map((k) => k.level))),
    }),
    [colleges],
  );

  const shown = colleges.filter(
    (c) =>
      (!f.state || c.state === f.state) &&
      (!f.type || c.type === f.type) &&
      (!(f.stream || f.level) ||
        c.courses.some((k) => (!f.stream || k.stream === f.stream) && (!f.level || k.level === f.level))),
  );
  const active = Object.values(f).some(Boolean);

  const select = (key: keyof Filters, label: string, all: string) => (
    <div className={s.fl}>
      <label htmlFor={`f-${key}`}>{label}</label>
      <select id={`f-${key}`} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })}>
        <option value={ANY}>{all}</option>
        {opts[key].map((o) => (
          <option key={o} value={o}>
            {o}
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
                  <div className={s.act}>
                    <Link className={`${s.btn} ${s.btnDark}`} href={`/colleges/${c.slug}`}>
                      View college<span className="sr-only">: {c.name}</span>
                    </Link>
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
    </div>
  );
}
