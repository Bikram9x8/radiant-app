import s from "./landing.module.css";

// SAMPLE colleges for the design only (no college database yet). Each card carries a "Sample" tag,
// the section ends with a footnote, and there are no "View college" links.

function ModernBlock({ tone, block }: { tone: string; block: string }) {
  return (
    <>
      <rect width="300" height="150" fill={tone} />
      <rect y="132" width="300" height="18" fill="#cdeee0" />
      <rect x="100" y="30" width="130" height="104" fill={block} />
      {Array.from({ length: 24 }, (_, i) => {
        const r = Math.floor(i / 6);
        const c = i % 6;
        return (
          <rect key={i} x={110 + c * 20} y={40 + r * 22} width="14" height="14" rx="2" fill={(r + c) % 2 ? "#ffedd5" : "#fdba74"} />
        );
      })}
      <rect x="40" y="80" width="56" height="54" fill="#f1f5f9" />
      <circle cx="262" cy="110" r="22" fill="#14b8a6" />
      <rect x="259" y="118" width="6" height="16" fill="#7c5a3a" />
    </>
  );
}

function ClassicBlock({ tone, block }: { tone: string; block: string }) {
  return (
    <>
      <rect width="300" height="150" fill={tone} />
      <circle cx="250" cy="34" r="16" fill="#fff" opacity=".6" />
      <rect y="132" width="300" height="18" fill="#cdeee0" />
      <rect x="86" y="62" width="128" height="72" fill="#e2e8f0" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={96 + i * 22} y="70" width="9" height="62" fill="#fff" />
      ))}
      <path d="M80 64h140l-70-30z" fill={block} />
    </>
  );
}

function MedicalBlock({ tone, block }: { tone: string; block: string }) {
  return (
    <>
      <rect width="300" height="150" fill={tone} />
      <rect y="132" width="300" height="18" fill="#cdeee0" />
      <rect x="70" y="48" width="160" height="86" fill="#fff" />
      <rect x="120" y="30" width="60" height="24" fill="#fff" />
      <rect x="141" y="34" width="18" height="16" fill={block} />
      <rect x="134" y="38" width="32" height="8" fill={block} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={84 + i * 28} y="64" width="18" height="16" rx="2" fill="#99f6e4" />
          <rect x={84 + i * 28} y="92" width="18" height="16" rx="2" fill="#99f6e4" />
        </g>
      ))}
      <rect x="136" y="112" width="28" height="22" fill={block} />
    </>
  );
}

const COLLEGES = [
  { ini: "NI", name: "Northfield Institute of Technology", place: "Mohali, Punjab", kind: "Private · Est. 2004", courses: ["B.Tech", "BCA", "MBA"], fee: "₹1.4L", by: "JEE Main", Art: ModernBlock, tone: "#ccfbf1", block: "#0f2e33" },
  { ini: "GC", name: "Greenvale Government College", place: "Chandigarh", kind: "Government · Est. 1966", courses: ["B.Sc", "B.Com", "BA"], fee: "₹38K", by: "Merit", Art: ClassicBlock, tone: "#fff4ec", block: "#0f766e" },
  { ini: "RM", name: "Riverside Medical College", place: "Patiala, Punjab", kind: "Government · Est. 1953", courses: ["MBBS", "Nursing"], fee: "₹1.0L", by: "NEET UG", Art: MedicalBlock, tone: "#dff7f4", block: "#c2410c" },
];

export default function CollegeCards() {
  return (
    <section className={`${s.wrap} ${s.section}`} aria-labelledby="home-colleges">
      <div className={s.headRow}>
        <h2 id="home-colleges" className={s.h2}>
          Colleges students <span className={s.ser}>are viewing</span>
        </h2>
        <span className={`${s.tag} ${s.soon}`}>College pages coming soon</span>
      </div>
      <p className={s.lead}>
        Every college page will show courses, fees, eligibility, entrance exams, placements and how to apply.
      </p>

      <ul className={`${s.cgrid} m-0 list-none p-0`}>
        {COLLEGES.map(({ Art, ...c }) => (
          <li key={c.ini} className={`${s.sticker} ${s.college}`}>
            <div className={s.collegeTop}>
              <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
                <Art tone={c.tone} block={c.block} />
              </svg>
              <span className={s.collegeIni} aria-hidden="true">
                {c.ini}
              </span>
              <span className={`${s.tag} ${s.sampleTag}`}>Sample</span>
            </div>
            <div className={s.collegeBody}>
              <h3 className={s.h3}>{c.name}</h3>
              <div className={s.meta}>
                {c.place} · {c.kind}
              </div>
              <ul className={s.tags} aria-label="Courses">
                {c.courses.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <dl className={s.facts}>
                <div>
                  <dt>Fees per year from</dt>
                  <dd>{c.fee}</dd>
                </div>
                <div>
                  <dt>Admission by</dt>
                  <dd>{c.by}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ul>
      <p className={s.sample}>Sample colleges and numbers, to show what college pages will look like.</p>
    </section>
  );
}
