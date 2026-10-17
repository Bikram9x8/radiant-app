import Link from "next/link";

const SECTIONS = [
  {
    title: "School",
    links: [
      { label: "CBSE, Class 1 to 12", href: "/courses/cbse" },
      { label: "ICSE, Class 1 to 10", href: "/courses/icse" },
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
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-extrabold uppercase tracking-wider text-white">{section.title}</p>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[15px] hover:underline">
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
