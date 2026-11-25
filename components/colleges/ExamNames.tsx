import Link from "next/link";
import { examPath, examSlug } from "@/lib/colleges/exams";
import s from "./colleges.module.css";

// "JEE Main, Merit (Class 12 marks)": exams with their own page are links to it, the rest plain text
export default function ExamNames({ exams }: { exams: string[] }) {
  return (
    <>
      {exams.map((e, i) => {
        const slug = examSlug(e);
        return (
          <span key={e}>
            {i > 0 && ", "}
            {slug ? (
              <Link className={s.examLink} href={examPath(slug)}>
                {e}
              </Link>
            ) : (
              e
            )}
          </span>
        );
      })}
    </>
  );
}
