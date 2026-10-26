import Link from "next/link";

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
    <footer className="bg-[#1b1740] text-[#e9e6fb] mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-8">
        {/* Brand */}
        <div className="max-w-md">
          <Link href="/" className="inline-block">
            <img src="/logo-dark.png" alt="Radiant Educations" className="h-11 w-auto" />
          </Link>
          <p className="mt-4 text-[15px] text-[#b7b2dd]">
            Notes, solutions, tests and guidance for school and higher education, organised class by
            class and chapter by chapter.
          </p>
        </div>

        {/* Links */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              {section.href ? (
                <Link
                  href={section.href}
                  className="text-sm font-extrabold uppercase tracking-wider text-white hover:text-[#c9bcff] transition-colors duration-300"
                >
                  {section.title}
                </Link>
              ) : (
                <p className="text-sm font-extrabold uppercase tracking-wider text-white">{section.title}</p>
              )}
              <ul className="mt-4 space-y-2.5">
                {section.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] text-[#e9e6fb] hover:text-white hover:underline transition-colors duration-300"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 pt-5 border-t border-[#3a3466] text-sm text-[#b7b2dd]">
          © {new Date().getFullYear()} Radiant Educations
        </p>
      </div>
    </footer>
  );
}