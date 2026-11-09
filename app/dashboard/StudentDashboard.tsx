import Link from "next/link";
import {
  IconBook,
  IconBook2,
  IconCertificate,
  IconClipboardList,
  IconFileText,
  IconPackage,
  IconSchool,
  IconTargetArrow,
  IconTool,
} from "@tabler/icons-react";
import { StudyArt } from "@/components/AuthLayout";
import { HigherArt, SchoolArt, TestArt } from "@/components/Illustrations";

type RecentApplication = {
  id: string;
  status: string;
  appliedAt: Date;
  opportunity: {
    id: string;
    title: string;
    company: { companyName: string } | null;
  };
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d28d9]";

const quickLinks = [
  {
    href: "/school",
    label: "School Education",
    desc: "Pick your board and class",
    colour: "pastel-purple",
    Art: SchoolArt,
  },
  {
    href: "/higher",
    label: "Higher Education",
    desc: "Choose where you are in your studies",
    colour: "pastel-mint",
    Art: HigherArt,
  },
  {
    href: "/opportunities",
    label: "Tests",
    desc: "Test series, sample papers and DPPs",
    colour: "pastel-yellow",
    Art: TestArt,
  },
];

const linkGroups = [
  {
    label: "Tests",
    colour: "pastel-yellow",
    links: [
      { href: "/opportunities", label: "Test Series", Icon: IconFileText },
      { href: "/search?division=CBSE_SAMPLE_PAPERS", label: "CBSE Sample Papers", Icon: IconCertificate },
      { href: "/opportunities?division=DPP", label: "DPP", Icon: IconClipboardList },
      { href: "/opportunities?division=BOARD_LEVEL_TEST", label: "Board Level Test", Icon: IconSchool },
      { href: "/opportunities?division=CHAPTER_WISE_TEST", label: "Chapter Wise Test", Icon: IconBook },
    ],
  },
  {
    label: "Study material",
    colour: "pastel-purple",
    links: [
      { href: "/search?division=NCERT_SOLUTION", label: "NCERT Solution", Icon: IconBook2 },
      { href: "/search?division=STUDY_PACKAGE", label: "Study Package", Icon: IconPackage },
    ],
  },
  {
    label: "Career",
    colour: "pastel-pink",
    links: [
      { href: "/search?division=SKILL_BUILDING", label: "Skill Building", Icon: IconTool },
      { href: "/search?division=CAREER_COUNSELING", label: "Career Counseling", Icon: IconTargetArrow },
    ],
  },
];

// The steps an application moves through, in order
const TRACK = [
  { status: "APPLIED", label: "Applied" },
  { status: "SHORTLISTED", label: "Shortlisted" },
  { status: "SELECTED", label: "Selected" },
];

function ApplicationTrack({ status }: { status: string }) {
  const reached = TRACK.findIndex((step) => step.status === status);

  // Rejected isn't a step on the way to Selected, so it gets no track
  if (reached === -1) {
    const label = status.charAt(0) + status.slice(1).toLowerCase();
    return <p className="mt-3 text-sm font-semibold text-[#3b3a55]">{label}</p>;
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <div aria-hidden="true" className="flex w-28 shrink-0 items-center">
        {TRACK.map((step, i) => (
          <div key={step.status} className={`flex items-center ${i === 0 ? "" : "flex-1"}`}>
            {i > 0 && <span className={`h-0.5 flex-1 ${i <= reached ? "bg-[#6d28d9]" : "bg-[#d4d4d8]"}`} />}
            <span
              className={`h-3 w-3 rounded-full border-2 ${
                i <= reached ? "border-[#6d28d9] bg-[#6d28d9]" : "border-[#d4d4d8] bg-white"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-sm font-semibold text-[#6d28d9]">{TRACK[reached].label}</p>
    </div>
  );
}

export default function StudentDashboard({
  fullName,
  applications,
}: {
  fullName?: string | null;
  applications: RecentApplication[];
}) {
  const firstName = fullName?.trim().split(/\s+/)[0];

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Welcome */}
      <section className="pastel-purple rounded-[16px] px-5 py-6 sm:px-10 sm:py-10 grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-8">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14142b]">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-3 max-w-prose text-[#3b3a55] sm:text-lg">
            Practice tests, career tools, and more — all in one place.
          </p>
          <Link
            href="/profile"
            className={`mt-5 inline-flex min-h-[44px] items-center rounded-xl border border-[#d4d4d8] bg-white px-4 text-sm font-semibold text-[#14142b] hover:border-[#6d28d9] hover:text-[#6d28d9] ${focusRing}`}
          >
            Edit profile
          </Link>
        </div>
        <StudyArt className="w-24 sm:w-56 lg:w-72" />
      </section>

      {/* Quick links */}
      <section aria-labelledby="quick-links" className="mt-4 sm:mt-6">
        <h2 id="quick-links" className="sr-only">
          Quick links
        </h2>
        <div className="grid gap-4 md:grid-cols-3 sm:gap-6">
          {quickLinks.map(({ href, label, desc, colour, Art }) => (
            <Link
              key={href}
              href={href}
              className={`card-lift ${colour} flex items-center justify-between gap-4 p-5 md:flex-col md:items-start md:p-6 ${focusRing}`}
            >
              <span className="min-w-0">
                <span className="block text-xl font-extrabold tracking-tight text-[#14142b]">{label}</span>
                <span className="mt-1 block text-sm text-[#3b3a55]">{desc}</span>
              </span>
              <span aria-hidden="true" className="shrink-0 md:self-end">
                <Art className="w-24 md:w-44 lg:w-52" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 lg:grid-cols-12 lg:items-start">
        {/* Recent applications */}
        <section aria-labelledby="recent-applications" className="card p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="recent-applications" className="text-lg font-bold text-[#14142b]">
              Recent applications
            </h2>
            <Link
              href="/my-applications"
              className={`rounded text-sm font-semibold text-[#6d28d9] hover:underline ${focusRing}`}
            >
              My Applications
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="mt-4">
              <p className="text-[#3b3a55]">You haven&apos;t applied to anything yet.</p>
              <Link
                href="/opportunities"
                className={`mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white hover:bg-[#5b21b6] ${focusRing}`}
              >
                Browse opportunities
              </Link>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-[#e4e2ef]">
              {applications.map((app) => (
                <li key={app.id} className="py-4 last:pb-0">
                  <Link
                    href={`/opportunities/${app.opportunity.id}`}
                    className={`rounded font-semibold text-[#14142b] hover:text-[#6d28d9] hover:underline ${focusRing}`}
                  >
                    {app.opportunity.title}
                  </Link>
                  <p className="mt-1 text-sm text-[#3b3a55]">
                    {app.opportunity.company?.companyName
                      ? `${app.opportunity.company.companyName}, applied `
                      : "Applied "}
                    {app.appliedAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                  <ApplicationTrack status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Practice and study */}
        <section aria-labelledby="practice-and-study" className="card p-5 sm:p-6 lg:col-span-5">
          <h2 id="practice-and-study" className="text-lg font-bold text-[#14142b]">
            Practice and study
          </h2>
          <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-1">
            {linkGroups.map((group) => (
              <div key={group.label} className={group.label === "Tests" ? "sm:row-span-2 lg:row-span-1" : ""}>
                <h3 className="text-sm font-semibold text-[#3b3a55]">{group.label}</h3>
                <ul className="mt-1">
                  {group.links.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className={`-mx-2 flex min-h-[44px] items-center gap-3 rounded-xl px-2 text-sm font-semibold text-[#14142b] hover:bg-[#f6f5fb] hover:text-[#6d28d9] ${focusRing}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`${group.colour} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg`}
                        >
                          <Icon size={18} stroke={2} />
                        </span>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
