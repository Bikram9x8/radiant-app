import Link from "next/link";
import s from "@/components/site-chrome.module.css";
import RadiantLogo from "@/components/brand/RadiantLogo";
import { SHOW_SCHOOL } from "@/lib/features";

type FooterLink = { label: string; href?: string }; // no href = not built yet ("Coming soon")
type Section = { title: string; links: FooterLink[] };

const HE = "/courses/higher-education/after-12th";

// Shown only while School Education is switched on (lib/features.ts)
const SCHOOL_SECTION: Section = {
  title: "School",
  links: [
    { label: "School Education", href: "/school" },
    { label: "CBSE, Class 9 to 12", href: "/courses/cbse" },
    { label: "ICSE, Class 9 to 10", href: "/courses/icse" },
    { label: "Skill Building", href: "/courses/vocational/skill-building" },
  ],
};

const SECTIONS: Section[] = [
  ...(SHOW_SCHOOL ? [SCHOOL_SECTION] : []),
  {
    title: "Explore",
    links: [
      { label: "Colleges", href: "/higher" },
      { label: "Courses", href: "/higher" },
      { label: "Entrance exams", href: "/opportunities" },
    ],
  },
  {
    title: "Exam prep",
    links: [
      { label: "JEE", href: "/courses/competitive/jee" },
      { label: "NEET", href: "/courses/competitive/neet" },
      { label: "NET", href: "/courses/competitive/net" },
      { label: "SSC", href: "/courses/competitive/ssc" },
      { label: "UPSC", href: "/courses/competitive/upsc" },
    ],
  },
  {
    title: "Opportunities",
    links: [
      { label: "Scholarships", href: `${HE}/scholarships` },
      { label: "Internships", href: `${HE}/internships` },
      { label: "Jobs & careers", href: `${HE}/jobs-careers` },
    ],
  },
  {
    title: "Radiant",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Report a problem", href: "/report-problem" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const BLURB = SHOW_SCHOOL
  ? "Notes, solutions, tests and guidance for school and higher education, organised class by class and chapter by chapter."
  : "Colleges, courses, entrance exams, scholarships and internships for students across India.";

export default function Footer() {
  return (
    <footer className={`${s.chrome} ${s.footer} mt-auto`}>
      <div className={`${s.wrap} pt-11 pb-8`}>
        <div className={s.footGrid} style={{ "--cols": SECTIONS.length } as React.CSSProperties}>
          {/* Brand */}
          <div>
            <Link href="/" aria-label="Radiant Educations home" className="inline-flex rounded-lg">
              <RadiantLogo className="h-8" />
            </Link>
            <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-(--muted)">{BLURB}</p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className={`${s.display} ${s.footTitle}`}>{section.title}</h2>
              <ul className="m-0 list-none p-0">
                {section.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <Link href={l.href} className={s.footLink}>
                        {l.label}
                      </Link>
                    ) : (
                      <span className={s.soon}>
                        {l.label} <span className={s.soonTag}>Coming soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={`${s.divider} mt-10 border-t pt-5 text-sm text-(--muted)`}>
          © {new Date().getFullYear()} Radiant Educations
        </p>
      </div>
    </footer>
  );
}
