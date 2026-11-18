import type { Fact } from "@/lib/abroad/types";
import { formatDate, uniqueSources } from "@/lib/abroad/format";
import s from "./abroad.module.css";

// "Source: IRCC (Government of Canada) · checked 20 Nov 2026" for every fact a block shows.
// Every number on a Study Abroad page sits in a block that renders this list.
export default function Sources({
  facts,
  label = "Source",
  className = "",
}: {
  facts: (Fact<unknown> | undefined | null)[];
  label?: string;
  className?: string;
}) {
  const list = uniqueSources(facts);
  if (list.length === 0) return null;
  return (
    <ul className={`${s.sources} ${className}`}>
      {list.map((f) => (
        <li key={f.sourceUrl}>
          {label}:{" "}
          <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer">
            {f.sourceName}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{" "}
          · checked {formatDate(f.lastChecked)}
          {f.note ? ` · ${f.note}` : ""}
        </li>
      ))}
    </ul>
  );
}
