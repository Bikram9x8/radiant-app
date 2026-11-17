import Link from "next/link";
import s from "./landing.module.css";

const HE = "/courses/higher-education/after-12th";
const STROKE = { fill: "none", stroke: "#115e59", strokeWidth: 2 } as const;

const ICONS = {
  college: (
    <g {...STROKE} strokeLinejoin="round">
      <path d="M3 10 12 5l9 5-9 5z" />
      <path d="M7 12v4c3 2 7 2 10 0v-4" />
    </g>
  ),
  exam: (
    <g {...STROKE} strokeLinecap="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </g>
  ),
  scholarship: (
    <g {...STROKE} strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13l-2 8 5-3 5 3-2-8" />
    </g>
  ),
  internship: (
    <g {...STROKE} strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2" />
    </g>
  ),
  job: (
    <g {...STROKE} strokeLinecap="round">
      <path d="M4 18 10 12l4 4 6-8" />
      <path d="M15 8h5v5" />
    </g>
  ),
  test: (
    <g {...STROKE} strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
};

// href: null = not built yet, shown with "Coming soon" and no link
const PATHS: { title: string; text: string; tint: string; icon: keyof typeof ICONS; href: string | null }[] = [
  { title: "Colleges & courses", text: "Courses and options after Class 12. College search is coming soon.", tint: "var(--tint-teal)", icon: "college", href: "/higher" },
  { title: "Entrance exams", text: "JEE and NEET practice tests, chapter by chapter.", tint: "var(--tint-mint)", icon: "exam", href: "/opportunities" },
  { title: "Scholarships", text: "Central and state schemes, with steps to apply.", tint: "var(--tint-sand)", icon: "scholarship", href: `${HE}/scholarships` },
  { title: "Internships", text: "Openings across India for college students.", tint: "var(--tint-aqua)", icon: "internship", href: `${HE}/internships` },
  { title: "Jobs & careers", text: "Career paths after each degree, and first jobs.", tint: "var(--tint-coral)", icon: "job", href: `${HE}/jobs-careers` },
  { title: "Free career test", text: "Find the career and course that fits you.", tint: "var(--tint-peach)", icon: "test", href: null },
];

export default function JourneyCards() {
  return (
    <section className={`${s.wrap} ${s.section}`} aria-labelledby="home-journey">
      <h2 id="home-journey" className={s.h2}>
        Everything after <span className={s.ser}>Class 12</span>
      </h2>
      <p className={s.lead}>Pick where you are in your journey.</p>

      <ul className={`${s.paths} m-0 list-none p-0`}>
        {PATHS.map((p) => {
          const inner = (
            <>
              <span className={s.ico} style={{ background: p.tint }} aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" focusable="false">
                  {ICONS[p.icon]}
                </svg>
              </span>
              <h3 className={s.h3}>{p.title}</h3>
              <p>{p.text}</p>
              {p.href ? (
                <span className={s.go} aria-hidden="true">
                  Explore →
                </span>
              ) : (
                <span className={`${s.tag} ${s.soon} mt-auto self-start`}>Coming soon</span>
              )}
            </>
          );
          return (
            <li key={p.title} className="flex">
              {p.href ? (
                <Link href={p.href} className={`${s.sticker} ${s.path} w-full`}>
                  {inner}
                </Link>
              ) : (
                <div className={`${s.sticker} ${s.path} w-full`}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
