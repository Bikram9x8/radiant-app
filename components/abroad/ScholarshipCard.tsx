import type { Scholarship } from "@/lib/abroad/types";
import Flag from "./Flag";
import Sources from "./Sources";
import s from "./abroad.module.css";

// One scholarship: covers and deadline are facts (with sources); always links its official page
export default function ScholarshipCard({ item }: { item: Scholarship }) {
  return (
    <article className={s.sc}>
      <Flag code={item.flag} className={s.scFlag} />
      <div className={s.scMain}>
        <h3 className={s.h3}>{item.name}</h3>
        <p className={s.meta}>
          {item.levels.join(" / ")} · by {item.provider}
        </p>
        <p className={s.scCovers}>
          <b>Covers:</b> {item.covers ? item.covers.value : "See the official page"}
        </p>
        {item.tags.length > 0 && (
          <ul className={s.tags}>
            {item.tags.map((t, i) => (
              <li key={t} className={i === 0 ? undefined : s.tagGrey}>
                {t}
              </li>
            ))}
          </ul>
        )}
        <a className={s.scLink} href={item.officialUrl} target="_blank" rel="noopener noreferrer">
          Official page<span className="sr-only"> for {item.name} (opens in a new tab)</span> →
        </a>
      </div>
      <div className={s.scDeadline}>
        <b>Deadline</b>
        {item.deadline ? item.deadline.value : "See the official page"}
      </div>
      {/* Last row, under the text and the deadline (it covers both) */}
      <Sources className={s.scSources} facts={[item.covers, item.deadline]} />
    </article>
  );
}
