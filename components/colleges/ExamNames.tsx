import { Fragment } from "react";
import Link from "next/link";
import { examPath, examSlug } from "@/lib/colleges/exams";
import s from "./colleges.module.css";

// "JEE Main, Merit (Class 12 marks)": exams with their own page are links to it, the rest plain text.
// The whole list is ONE inline element: in the phone card layout the table cell is a flex row, and
// separate pieces would each become a flex item that can be squeezed until "CAT" breaks into letters.
export default function ExamNames({ exams }: { exams: string[] }) {
  return (
    <span className={s.examNames}>
      {exams.map((e, i) => {
        const slug = examSlug(e);
        return (
          <Fragment key={e}>
            {i > 0 && ", "}
            {slug ? (
              <Link className={s.examLink} href={examPath(slug)}>
                {e}
              </Link>
            ) : (
              e
            )}
          </Fragment>
        );
      })}
    </span>
  );
}
