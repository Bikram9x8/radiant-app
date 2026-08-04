import Link from "next/link";
import { IconFileText, IconTool, IconTargetArrow, IconPackage, IconClipboardList, IconSchool, IconBook } from "@tabler/icons-react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const [categories, latestOpportunities, totalTests] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }}),
    prisma.opportunity.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { category: { select: { name: true } } },
    }),
    prisma.opportunity.count({ where: { status: "APPROVED" } }),
  ]);

  return (
    <div className="flex-1">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/30 dark:to-zinc-950">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-purple-100 dark:bg-purple-900/30" />
        <div className="absolute bottom-0 right-24 w-32 h-32 rounded-full bg-amber-50 dark:bg-amber-900/20" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 flex flex-col items-start">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
            Free forever for students
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-5 max-w-2xl text-zinc-900 dark:text-white">
            Practice tests for Class 12 boards and entrance exams
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-4 max-w-xl">
            Physics, Chemistry, Maths, Biology, English, JEE, NEET, and CUET — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/opportunities"
              className="rounded-lg px-6 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              Browse tests →
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-6 py-3 border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Sign up as Student
            </Link>
            <Link
              href="/signup/company"
              className="rounded-lg px-6 py-3 border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Sign up as Company
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative max-w-5xl mx-auto px-6 pb-12 grid grid-cols-2 gap-4">
          <div className="glass text-center py-7 rounded-3xl bg-gradient-to-br from-purple-50/80 to-transparent dark:from-purple-900/20">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalTests}+</p>
            <p className="text-xs text-zinc-500 mt-1">Practice tests</p>
          </div>
          <div className="glass text-center py-7 rounded-3xl bg-gradient-to-br from-purple-50/80 to-transparent dark:from-purple-900/20">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Subjects and exams</p>
          </div>
        </div>
      </div>

      {/* Main divisions */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { href: "/opportunities", label: "Test Series", Icon: IconFileText, gradient: "from-emerald-400 to-cyan-400", glow: "shadow-[0_0_16px_rgba(52,211,153,0.5)]" },
            { href: "/opportunities?division=SKILL_BUILDING", label: "Skill Building", Icon: IconTool, gradient: "from-pink-400 to-purple-400", glow: "shadow-[0_0_16px_rgba(244,114,182,0.5)]" },
            { href: "/opportunities?division=CAREER_COUNSELING", label: "Career Counseling", Icon: IconTargetArrow, gradient: "from-cyan-400 to-blue-400", glow: "shadow-[0_0_16px_rgba(34,211,238,0.5)]" },
            { href: "/opportunities?division=STUDY_PACKAGE", label: "Study Package", Icon: IconPackage, gradient: "from-lime-400 to-emerald-400", glow: "shadow-[0_0_16px_rgba(163,230,53,0.5)]" },
            { href: "/opportunities?division=DPP", label: "DPP", Icon: IconClipboardList, gradient: "from-amber-400 to-pink-400", glow: "shadow-[0_0_16px_rgba(251,191,36,0.5)]" },
            { href: "/opportunities?division=BOARD_LEVEL_TEST", label: "Board Level Test", Icon: IconSchool, gradient: "from-emerald-400 to-purple-400", glow: "shadow-[0_0_16px_rgba(52,211,153,0.5)]" },
            { href: "/opportunities?division=CHAPTER_WISE_TEST", label: "Chapter Wise Test", Icon: IconBook, gradient: "from-purple-400 to-pink-400", glow: "shadow-[0_0_16px_rgba(192,132,252,0.5)]" },
          ].map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="glass rounded-3xl p-6 hover:scale-[1.03] transition-transform flex flex-col items-center text-center gap-3 min-h-[160px] justify-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tile.gradient} ${tile.glow} flex items-center justify-center`}>
                <tile.Icon size={26} color="white" stroke={2} />
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tile.label}</p>
            </Link>
          ))}
        </div>

        {/* Latest tests */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Latest tests</h2>
          <Link href="/opportunities" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
            View all
          </Link>
        </div>

        {latestOpportunities.length === 0 ? (
          <p className="text-sm text-zinc-500">No tests posted yet. Check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {latestOpportunities.map((o) => (
              <Link
                key={o.id}
                href={`/opportunities/${o.id}`}
                className="glass rounded-3xl p-6 hover:scale-[1.03] transition-transform bg-gradient-to-br from-purple-50/60 to-transparent dark:from-purple-900/10"
              >
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                  {o.category.name}
                </span>
                <p className="text-sm font-medium mt-3 text-zinc-900 dark:text-white">{o.title}</p>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{o.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
