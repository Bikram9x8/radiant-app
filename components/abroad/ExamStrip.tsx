import Link from "next/link";
import { verifiedExams } from "@/lib/abroad";
import { PLANNED_EXAMS } from "@/lib/abroad/planned";
import s from "./abroad.module.css";

// Exam cards: verified exams link to their guide; the rest are "Coming soon" (no link, no numbers)
export default function ExamStrip() {
  const verified = new Map(verifiedExams().map((e) => [e.slug, e]));
  return (
    <ul className={s.exams}>
      {PLANNED_EXAMS.map((p) => {
        const e = verified.get(p.slug);
        return (
          <li key={p.slug}>
            {e ? (
              <Link href={`/abroad/exams/${e.slug}`} className={s.exam}>
                <b>{e.name}</b>
                <small>{e.purpose}</small>
                {e.scoreScale && <small>{e.scoreScale.value}</small>}
              </Link>
            ) : (
              <div className={`${s.exam} ${s.examSoon}`}>
                <b>{p.name}</b>
                <small>{p.purpose}</small>
                <span className={s.soonTag}>Coming soon</span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
