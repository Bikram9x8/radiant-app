import Link from "next/link";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/site-chrome.module.css";
import RadiantLogo from "@/components/brand/RadiantLogo";

const SECTIONS = [
  {
    title: "School Education",
    href: "/school",
    links: [
      { label: "CBSE, Class 9 to 12", href: "/courses/cbse" },
      { label: "ICSE, Class 9 to 10", href: "/courses/icse" },
    ],
  },
  {
    title: "Higher Education",
    href: "/higher",
    links: [
      { label: "After 12th", href: "/courses/higher-education/after-12th" },
      { label: "After Graduation", href: "/courses/higher-education/after-graduation" },
      { label: "After Post Graduation", href: "/courses/higher-education/after-post-graduation" },
    ],
  },
  {
    title: "Competitive",
    links: [
      { label: "JEE", href: "/courses/competitive/jee" },
      { label: "NEET", href: "/courses/competitive/neet" },
      { label: "NET", href: "/courses/competitive/net" },
      { label: "SSC", href: "/courses/competitive/ssc" },
      { label: "UPSC", href: "/courses/competitive/upsc" },
    ],
  },
  {
    title: "Vocational",
    links: [
      { label: "Skill Building", href: "/courses/vocational/skill-building" },
      { label: "Geeta", href: "/courses/vocational/geeta" },
      { label: "Mahabharat", href: "/courses/vocational/mahabharat" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Report a problem", href: "/report-problem" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={`${fredoka.variable} ${nunito.variable} ${s.chrome} ${s.footer} mt-auto`}>
      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-8 sm:px-8 md:pt-14">
        {/* Brand */}
        <div className="max-w-md">
          <Link href="/" className="inline-flex rounded-xl">
            <RadiantLogo compact className="h-20 md:h-24" />
          </Link>
          <p className="mt-4 text-[15px] leading-relaxed font-semibold text-(--hp-muted)">
            Notes, solutions, tests and guidance for school and higher education, organised class by class
            and chapter by chapter.
          </p>
        </div>

        {/* Links */}
        <nav aria-label="Footer" className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              {section.href ? (
                <Link
                  href={section.href}
                  className={`${s.display} ${s.footerTitle} inline-flex min-h-11 items-center text-lg font-bold`}
                >
                  {section.title}
                </Link>
              ) : (
                <p className={`${s.display} m-0 flex min-h-11 items-center text-lg font-bold`}>{section.title}</p>
              )}
              <ul className="m-0 list-none p-0">
                {section.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className={`${s.footerLink} inline-flex min-h-11 items-center text-[15px] font-bold`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-8 border-t-2 border-(--hp-line) pt-5 text-sm font-semibold text-(--hp-muted)">
          © {new Date().getFullYear()} Radiant Educations
        </p>
      </div>
    </footer>
  );
}
