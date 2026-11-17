import s from "./landing.module.css";

// Guides aren't written yet: the cards show what's coming, with no links

function ScholarshipThumb() {
  return (
    <>
      <rect width="300" height="130" fill="#fff4ec" />
      <rect x="90" y="26" width="120" height="80" rx="6" fill="#fff" stroke="#cbd5e1" />
      <rect x="106" y="44" width="70" height="7" rx="3" fill="#0f2e33" />
      <rect x="106" y="58" width="88" height="5" rx="2" fill="#94a3b8" />
      <rect x="106" y="69" width="60" height="5" rx="2" fill="#94a3b8" />
      <circle cx="196" cy="92" r="18" fill="#f97350" />
      <path d="M186 106l-6 18 10-5 6 9 4-20M206 106l6 18-10-5-6 9" fill="#c2410c" />
      <circle cx="196" cy="92" r="8" fill="#fff" opacity=".7" />
    </>
  );
}

function CoursesThumb() {
  return (
    <>
      <rect width="300" height="130" fill="#ccfbf1" />
      <rect x="88" y="28" width="124" height="74" rx="6" fill="#0f2e33" />
      <rect x="96" y="36" width="108" height="58" rx="2" fill="#1d4e55" />
      <path d="M106 52l10 8-10 8M124 70h20" stroke="#fb923c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="150" y="48" width="40" height="5" rx="2" fill="#5eead4" />
      <rect x="150" y="60" width="28" height="5" rx="2" fill="#5eead4" />
      <path d="M72 102h156l-10 10H82z" fill="#94a3b8" />
    </>
  );
}

function EntranceThumb() {
  return (
    <>
      <rect width="300" height="130" fill="#dff7f4" />
      <rect x="70" y="80" width="110" height="16" rx="3" fill="#0f766e" />
      <rect x="78" y="64" width="100" height="16" rx="3" fill="#f97350" />
      <rect x="66" y="48" width="106" height="16" rx="3" fill="#0f2e33" />
      <rect x="190" y="30" width="56" height="66" rx="6" fill="#fff" stroke="#cbd5e1" />
      <rect x="190" y="30" width="56" height="16" rx="6" fill="#c2410c" />
      <text
        x="218"
        y="80"
        textAnchor="middle"
        fontWeight="800"
        fontSize="30"
        fill="#0f2e33"
        style={{ fontFamily: "var(--font-big-shoulders), sans-serif" }}
      >
        180
      </text>
      <rect x="60" y="96" width="190" height="6" rx="3" fill="#94a3b8" />
    </>
  );
}

const GUIDES = [
  { kind: "Scholarships", title: "How to apply for the Post Matric Scholarship in Punjab", text: "Eligibility, documents and the step-by-step online process.", tint: "var(--tint-sand)", Thumb: ScholarshipThumb },
  { kind: "Courses", title: "What to do after BCA: jobs, MCA and other paths", text: "Salaries, skills and the courses that lead to each path.", tint: "var(--tint-teal)", Thumb: CoursesThumb },
  { kind: "Entrance", title: "JEE Main preparation plan for the last 6 months", text: "A month-by-month plan with chapter weightage.", tint: "var(--tint-mint)", Thumb: EntranceThumb },
];

export default function Guides() {
  return (
    <section className={`${s.wrap} ${s.section}`} aria-labelledby="home-guides">
      <h2 id="home-guides" className={s.h2}>
        Guides for <span className={s.ser}>students</span>
      </h2>
      <p className={s.lead}>Clear answers to the questions students ask most, checked against official sources and dated.</p>

      <ul className={`${s.guides} m-0 list-none p-0`}>
        {GUIDES.map(({ Thumb, ...g }) => (
          <li key={g.kind} className={`${s.sticker} ${s.guide}`}>
            <svg className={s.thumb} viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
              <Thumb />
            </svg>
            <div className={s.guideBody}>
              <span className={s.kind} style={{ background: g.tint }}>
                {g.kind}
              </span>
              <h3 className={s.h3}>{g.title}</h3>
              <p>{g.text}</p>
              <span className={`${s.tag} ${s.soon}`}>Coming soon</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
