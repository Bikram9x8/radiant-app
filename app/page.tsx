import Link from "next/link";
import {
  IconFileText,
  IconCircleCheck,
  IconClipboardCheck,
  IconListCheck,
  IconHistory,
  IconCalendarEvent,
  IconSearch,
} from "@tabler/icons-react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Pastel colours for the tiles (full class names so Tailwind keeps them)
const TILE_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-green-100 text-green-700",
];

const CHAPTER_ITEMS = [
  { label: "Notes", text: "Clear chapter notes to revise from.", Icon: IconFileText, color: "bg-violet-100 text-violet-700" },
  { label: "Solutions", text: "Step-by-step textbook solutions.", Icon: IconCircleCheck, color: "bg-green-100 text-green-700" },
  { label: "Tests", text: "Chapter-wise practice tests.", Icon: IconClipboardCheck, color: "bg-blue-100 text-blue-700" },
  { label: "MCQ Tests", text: "Quick multiple-choice checks.", Icon: IconListCheck, color: "bg-orange-100 text-orange-700" },
  { label: "PYQ", text: "Previous-year questions.", Icon: IconHistory, color: "bg-pink-100 text-pink-700" },
  { label: "DPP", text: "Daily practice problems.", Icon: IconCalendarEvent, color: "bg-teal-100 text-teal-700" },
];

// Empty box reserved for advertisements. Replace the inside later with real ad code.
function AdSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`mx-auto w-full border border-dashed border-zinc-300 rounded-lg bg-zinc-50 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Advertisement</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const [courses, latestOpportunities] = await Promise.all([
    prisma.courseNode.findMany({
      where: { kind: "COURSE", isActive: true },
      orderBy: { position: "asc" },
      include: {
        children: { where: { isActive: true }, orderBy: { position: "asc" } },
      },
    }),
    prisma.opportunity.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="flex-1 bg-white">
      {/* Ad slot 1 */}
      <div className="max-w-5xl mx-auto px-6 pt-4">
        <AdSlot label="728 × 90 banner space" className="max-w-[728px] h-[90px]" />
      </div>

      {/* Hero */}
      <section className="mt-4 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-wrap items-center gap-10">
          <div className="flex-1 basis-[420px] min-w-0">
            <p className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
              CBSE · ICSE · JEE · NEET · UPSC and more
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-[#14142b]">
              Study smarter for school and entrance exams
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600">
              Notes, NCERT solutions, chapter tests, MCQs, previous-year questions and daily practice
              problems, organised class by class and chapter by chapter.
            </p>

            <form action="/opportunities" method="get" className="mt-7 max-w-xl flex items-center gap-2 border border-zinc-300 rounded-2xl bg-white p-1.5 pl-4">
              <IconSearch size={20} className="text-zinc-500 shrink-0" />
              <input
                name="q"
                type="text"
                placeholder="Search a chapter, test or topic"
                aria-label="Search chapters, tests and notes"
                className="flex-1 min-w-0 outline-none bg-transparent py-2.5 text-base text-[#14142b]"
              />
              <button type="submit" className="btn-neon rounded-xl px-5 py-2.5 text-sm font-bold">
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/signup" className="block rounded-xl px-5 py-2.5 text-sm font-semibold border border-zinc-300 text-zinc-800 hover:bg-zinc-50">
                Sign up as Student
              </Link>
              <Link href="/signup/company" className="block rounded-xl px-5 py-2.5 text-sm font-semibold border border-zinc-300 text-zinc-800 hover:bg-zinc-50">
                Sign up as Company
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1 basis-[320px] min-w-0 flex justify-center">
            <svg viewBox="0 0 480 380" className="w-full max-w-[480px] h-auto" role="img" aria-label="Books, a graduation cap and a test sheet">
              <circle cx="240" cy="200" r="160" fill="#EDE9FE" />
              <circle cx="395" cy="78" r="26" fill="#FDE68A" />
              <circle cx="66" cy="112" r="14" fill="#FBCFE8" />
              <circle cx="440" cy="250" r="9" fill="#A7F3D0" />
              <rect x="50" y="300" width="380" height="14" rx="7" fill="#CFCCE3" />
              <rect x="90" y="256" width="190" height="44" rx="6" fill="#5B33D6" />
              <rect x="90" y="256" width="190" height="10" rx="5" fill="#7C5CE8" />
              <rect x="104" y="212" width="170" height="44" rx="6" fill="#F59E0B" />
              <rect x="104" y="212" width="170" height="10" rx="5" fill="#FBBF24" />
              <rect x="84" y="168" width="176" height="44" rx="6" fill="#10B981" />
              <rect x="84" y="168" width="176" height="10" rx="5" fill="#34D399" />
              <path d="M122 150v22c0 10 100 10 100 0v-22" fill="#3B3A55" />
              <polygon points="172,100 262,132 172,164 82,132" fill="#14142B" />
              <line x1="262" y1="132" x2="262" y2="172" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="262" cy="176" r="6" fill="#F59E0B" />
              <g transform="rotate(6 370 200)">
                <rect x="300" y="104" width="140" height="186" rx="12" fill="#FFFFFF" stroke="#CFCCE3" strokeWidth="2" />
                <rect x="316" y="124" width="64" height="8" rx="4" fill="#5B33D6" />
                <circle cx="330" cy="166" r="9" fill="#10B981" />
                <path d="m326 166 3 3 6-6" stroke="#FFFFFF" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="348" y="162" width="76" height="8" rx="4" fill="#E4E2EF" />
                <circle cx="330" cy="200" r="9" fill="#10B981" />
                <path d="m326 200 3 3 6-6" stroke="#FFFFFF" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="348" y="196" width="60" height="8" rx="4" fill="#E4E2EF" />
                <circle cx="330" cy="234" r="9" fill="#F472B6" />
                <path d="m326 230 8 8m0-8-8 8" stroke="#FFFFFF" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="348" y="230" width="70" height="8" rx="4" fill="#E4E2EF" />
                <rect x="316" y="260" width="108" height="10" rx="5" fill="#FDE68A" />
              </g>
              <g transform="rotate(-35 408 300)">
                <rect x="400" y="240" width="16" height="80" rx="3" fill="#F472B6" />
                <rect x="400" y="240" width="16" height="12" rx="3" fill="#3B3A55" />
                <polygon points="400,320 416,320 408,338" fill="#FDE68A" />
              </g>
              <path d="M420 150l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#F59E0B" />
              <path d="M60 220l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#5B33D6" />
            </svg>
          </div>
        </div>
      </section>

      {/* Choose your class or exam (read from the course tree) */}
      <section className="max-w-5xl mx-auto px-6 pt-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#14142b]">Choose your class or exam</h2>
        <p className="mt-2 text-zinc-600">Pick where you study. Everything inside is arranged as class, subject, chapter.</p>

        {courses.length === 0 && (
          <p className="mt-6 text-sm text-zinc-500">Courses are being set up. Check back soon.</p>
        )}

        {courses.map((course) => (
          <div key={course.id} className="mt-10">
            <h3 className="text-xl font-bold text-[#14142b]">{course.name}</h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {course.children.map((level, i) => (
                <Link
                  key={level.id}
                  href={`/courses/${course.slug}/${level.slug}`}
                  className={`block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${TILE_COLORS[i % TILE_COLORS.length]}`}
                >
                  <span className="block text-xs font-bold tracking-wider uppercase opacity-80">{course.name}</span>
                  <span className="block mt-1.5 text-xl font-extrabold text-[#14142b]">{level.name}</span>
                  <span className="block mt-3 text-sm font-bold">Open →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Ad slot 2 */}
      <div className="max-w-5xl mx-auto px-6 mt-14">
        <AdSlot label="970 × 120 banner space" className="max-w-[970px] h-[120px]" />
      </div>

      {/* Inside every chapter */}
      <section className="mt-14 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#14142b]">Inside every chapter</h2>
          <p className="mt-2 text-zinc-600">Open a chapter and switch between six things to study with.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHAPTER_ITEMS.map((item) => (
              <div key={item.label} className="flex gap-4 items-start rounded-2xl border border-zinc-200 bg-white p-5">
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <item.Icon size={24} stroke={2} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#14142b]">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently added + side ad */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex-1 basis-[460px] min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#14142b]">Recently added</h2>
              <Link href="/opportunities" className="text-sm font-bold text-[#5b33d6] hover:underline">
                View all →
              </Link>
            </div>

            {latestOpportunities.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">Nothing posted yet. Check back soon.</p>
            ) : (
              <div className="mt-6 border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-200">
                {latestOpportunities.map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunities/${o.id}`}
                    className="block px-5 py-4 bg-white hover:bg-zinc-50"
                  >
                    <p className="text-base font-bold text-[#14142b]">{o.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">{o.category?.name}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 w-full sm:w-[300px]">
            <AdSlot label="300 × 250 box space" className="max-w-full h-[250px]" />
          </div>
        </div>
      </section>
    </div>
  );
}