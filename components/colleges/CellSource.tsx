import type { CollegeView, SourceRef } from "@/lib/colleges/types";
import { sourceName } from "@/lib/colleges/format";
import { formatDate } from "@/lib/abroad/format";
import s from "./colleges.module.css";

// One source line under a single value (compare table): "UGC (PDF) · checked 23 Nov 2026".
// Shown only when the value is filled in, like the source lists on the college page.
export default function CellSource({
  src,
  college,
}: {
  src: SourceRef | null;
  college: Pick<CollegeView, "name" | "shortName" | "officialWebsite">;
}) {
  if (!src) return null;
  return (
    <small className={s.cellSrc}>
      <a href={src.url} target="_blank" rel="noopener noreferrer">
        {sourceName(src.url, college)}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      {src.checked ? ` · checked ${formatDate(src.checked)}` : ""}
    </small>
  );
}
