import Link from "next/link";
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
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
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
        <div className="relative max-w-5xl mx-auto px-6 pb-12 grid grid-cols-3 gap-4">
          <div className="glass text-center py-5 rounded-2xl">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalTests}+</p>
            <p className="text-xs text-zinc-500 mt-1">Practice tests</p>
          </div>
          <div className="glass text-center py-5 rounded-2xl">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Subjects and exams</p>
          </div>
          <div className="glass text-center py-5 rounded-2xl">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">Free</p>
            <p className="text-xs text-zinc-500 mt-1">Always</p>
          </div>
        </div>
      </div>

      {/* Browse by subject */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Browse by subject</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/opportunities?categoryId=${c.id}`}
              className="glass rounded-xl p-4 text-center hover:scale-[1.02] transition-transform"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{c.name}</p>
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
                className="glass rounded-xl p-4 hover:scale-[1.02] transition-transform"
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
