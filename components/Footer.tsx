import Link from "next/link";
import s from "@/components/site-chrome.module.css";
import RadiantLogo from "@/components/brand/RadiantLogo";
import { SHOW_ABROAD, SHOW_COLLEGES, SHOW_SCHOOL } from "@/lib/features";
import { getExam } from "@/lib/abroad";

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

// Shown only while Study Abroad is switched on (lib/features.ts). The IELTS link appears only once
// the IELTS guide is verified, so the footer never links to a missing page.
const ABROAD_SECTION: Section = {
  title: "Study abroad",
  links: [
    { label: "Countries", href: "/abroad" },
    { label: "Scholarships abroad", href: "/abroad/scholarships" },
    ...(getExam("ielts") ? [{ label: "IELTS guide", href: "/abroad/exams/ielts" }] : []),
  ],
};

const SECTIONS: Section[] = [
  ...(SHOW_SCHOOL ? [SCHOOL_SECTION] : []),
  {
    title: "Explore",
    links: [
      // With SHOW_COLLEGES on, "Colleges" opens the college list; otherwise it stays on /higher
      { label: "Colleges", href: SHOW_COLLEGES ? "/colleges" : "/higher" },
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
  ...(SHOW_ABROAD ? [ABROAD_SECTION] : []),
  {
    title: "Radiant",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Report a problem", href: "/report-problem" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const BLURB = SHOW_SCHOOL
  ? "Notes, solutions, tests and guidance for school and higher education, organised class by class and chapter by chapter."
  : SHOW_COLLEGES
    ? "Colleges, entrance exam prep, scholarships and internships for students after Class 12."
    : "Entrance exam prep, scholarships and internships for students after Class 12. Colleges and courses coming soon.";

export default function Footer() {
  return (
    <footer className={`${s.chrome} ${s.footer} mt-auto`}>
      <div className={`${s.wrap} pt-11 pb-8`}>
        <div
          // 5+ link columns (e.g. with Study abroad on) need a roomier middle layout (site-chrome.module.css)
          className={`${s.footGrid} ${SECTIONS.length >= 5 ? s.footGridMany : ""}`}
          style={{ "--cols": SECTIONS.length } as React.CSSProperties}
        >
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
