import Link from "next/link";
import s from "./landing.module.css";

// soon: no tests yet, so the card shows "Coming soon" and has no link
const EXAMS = [
  { name: "JEE Main", text: "Engineering (B.Tech, B.Arch)", subjects: ["Physics", "Chemistry", "Maths"], soon: false },
  { name: "NEET UG", text: "Medical (MBBS, BDS, Nursing)", subjects: ["Physics", "Chemistry", "Biology"], soon: false },
  { name: "CUET UG", text: "Central universities (BA, B.Com, B.Sc)", subjects: ["Language", "Domain", "General test"], soon: true },
  { name: "State exams", text: "State colleges and universities", subjects: ["By state"], soon: true },
];

function ExamBody({ name, text, subjects }: { name: string; text: string; subjects: string[] }) {
  return (
    <>
      <h3 className={s.h3}>{name}</h3>
      <p>{text}</p>
      <ul className={s.examSubjects}>
        {subjects.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </>
  );
}

// Dark band: JEE and NEET cards go to the practice tests page
export default function ExamsBand() {
  return (
    <section className={s.band} aria-labelledby="home-exams">
      <div className={`${s.wrap} ${s.bandInner}`}>
        <h2 id="home-exams" className={s.h2}>
          Entrance exam <span className={s.ser}>prep</span>
        </h2>
        <p className={s.lead}>Chapter-wise practice tests for JEE and NEET, with instant scores. More exams are coming soon.</p>

        <ul className={`${s.exams} m-0 list-none p-0`}>
          {EXAMS.map((e) => (
            <li key={e.name} className="flex">
              {e.soon ? (
                <div className={`${s.exam} ${s.examSoon} w-full`}>
                  <ExamBody {...e} />
                  <span className={`${s.tag} ${s.soon} mt-2 self-start`}>Coming soon</span>
                </div>
              ) : (
                <Link href="/opportunities" className={`${s.exam} w-full`}>
                  <ExamBody {...e} />
                  <span className={s.examGo} aria-hidden="true">
                    Practice tests →
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
