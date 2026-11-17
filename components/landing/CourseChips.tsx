import s from "./landing.module.css";

const COURSES = ["B.Tech", "MBBS", "BCA", "B.Com", "BBA", "B.Sc", "LLB", "B.Des", "B.Pharm", "Nursing"];

// Course pages don't exist yet: the chips are plain labels (no links) under a "Coming soon" tag
export default function CourseChips() {
  return (
    <section className={`${s.wrap} ${s.section}`} aria-labelledby="home-courses">
      <div className={s.headRow}>
        <h2 id="home-courses" className={s.h2}>
          Popular <span className={s.ser}>courses</span>
        </h2>
        <span className={`${s.tag} ${s.soon}`}>Course pages coming soon</span>
      </div>
      <p className={s.lead}>See which colleges offer them, the fees and the entrance exam you need.</p>
      <ul className={s.chips}>
        {COURSES.map((c) => (
          <li key={c} className={s.chip}>
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}
