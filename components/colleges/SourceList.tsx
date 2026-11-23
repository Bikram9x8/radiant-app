import type { CollegeView, SourceRef } from "@/lib/colleges/types";
import { mergeSources, sourceName } from "@/lib/colleges/format";
import { formatDate } from "@/lib/abroad/format";
import s from "./colleges.module.css";

// "Fees, Entrance exams: Amity University Punjab website (PDF) · checked 22 Nov 2026"
// for every fact group a block shows (like Study Abroad's <Sources>).
export default function SourceList({
  items,
  college,
  dark = false,
  className = "",
}: {
  items: { label: string; src: SourceRef | null }[];
  college: Pick<CollegeView, "name" | "shortName" | "officialWebsite">;
  dark?: boolean;
  className?: string;
}) {
  const list = mergeSources(items);
  if (list.length === 0) return null;
  return (
    <ul className={`${s.sources} ${dark ? s.sourcesDark : ""} ${className}`}>
      {list.map(({ labels, src }) => (
        <li key={`${src.url}|${src.checked}`}>
          {labels.map((l, i) => (i && /^[A-Z][a-z]/.test(l) ? l[0].toLowerCase() + l.slice(1) : l)).join(", ")}:{" "}
          <a href={src.url} target="_blank" rel="noopener noreferrer">
            {sourceName(src.url, college)}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          {src.checked ? ` · checked ${formatDate(src.checked)}` : ""}
        </li>
      ))}
    </ul>
  );
}
