import { daysLeft, deadlineLabel, linkText, postedBy, sourceLine, type UpdateView } from "@/lib/updates/format";
import u from "./updates.module.css";

// Chip colour per type (Teal + Coral tints from globals.css)
const TINT: Record<string, string> = {
  Internship: "var(--tint-aqua)",
  PhD: "var(--tint-teal)",
  MS: "var(--tint-teal)",
  Workshop: "var(--tint-mint)",
  Fellowship: "var(--tint-sand)",
  Scholarship: "var(--tint-peach)",
  "Exam date": "var(--tint-coral)",
};

// One item: type chip, title, organisation, one line, deadline, link and source line. Supervisor and
// organisation posts are labelled as such. Links leave the site: new tab, rel="noopener nofollow".
export default function UpdateCard({ item, compact = false, headingLevel = 3 }: { item: UpdateView; compact?: boolean; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const left = daysLeft(item.deadline);
  const by = postedBy(item.sourceType);
  const meta = compact ? [] : [item.dates, item.location, item.mode, item.forWho].filter(Boolean);
  return (
    <article className={`${u.item} ${compact ? u.itemCompact : ""}`}>
      <div className={u.top}>
        <span className={u.chip} style={{ background: TINT[item.type] ?? "var(--tint-teal)" }}>
          {item.type}
        </span>
        <span className={`${u.deadline} ${left !== null && left <= 7 ? u.deadlineSoon : ""}`}>{deadlineLabel(item.deadline)}</span>
      </div>
      <H className={u.title}>{item.title}</H>
      <p className={u.org}>{item.organisation}</p>
      <p className={u.line}>{item.oneLine}</p>
      {meta.length > 0 && <p className={u.meta}>{meta.join(" · ")}</p>}
      <div className={u.foot}>
        <a className={u.link} href={item.linkUrl} target="_blank" rel="noopener nofollow">
          {linkText(item.sourceType)} ↗<span className="sr-only">: {item.title} (opens in a new tab)</span>
        </a>
        {by && <span className={u.by}>{by}</span>}
      </div>
      <p className={u.src}>{sourceLine(item)}</p>
    </article>
  );
}
