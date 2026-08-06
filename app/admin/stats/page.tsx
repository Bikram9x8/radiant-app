import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FadeIn from "@/components/FadeIn";


export default async function AdminStatsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    totalStudents,
    totalCompaniesApproved,
    totalCompaniesPending,
    totalAdmins,
    oppPending,
    oppApproved,
    oppRejected,
    oppClosed,
    oppByType,
    appApplied,
    appShortlisted,
    appSelected,
    appRejected,
    totalCategories,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "COMPANY", status: "APPROVED" } }),
    prisma.user.count({ where: { role: "COMPANY", status: "PENDING" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.opportunity.count({ where: { status: "PENDING" } }),
    prisma.opportunity.count({ where: { status: "APPROVED" } }),
    prisma.opportunity.count({ where: { status: "REJECTED" } }),
    prisma.opportunity.count({ where: { status: "CLOSED" } }),
    prisma.opportunity.groupBy({ by: ["type"], _count: true }),
    prisma.application.count({ where: { status: "APPLIED" } }),
    prisma.application.count({ where: { status: "SHORTLISTED" } }),
    prisma.application.count({ where: { status: "SELECTED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.category.count(),
  ]);

  const totalOpportunities = oppPending + oppApproved + oppRejected + oppClosed;
  const totalApplications = appApplied + appShortlisted + appSelected + appRejected;

  return (
    <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">Stats</h1>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Users
        </h2>
        <FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Students" value={totalStudents} />
          <StatCard label="Companies (Approved)" value={totalCompaniesApproved} accent="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Companies (Pending)" value={totalCompaniesPending} accent="text-amber-600 dark:text-amber-400" />
          <StatCard label="Admins" value={totalAdmins} />
        </div>
        </FadeIn>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Opportunities ({totalOpportunities} total)
        </h2>
        <FadeIn delay={80}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard label="Pending" value={oppPending} accent="text-amber-600 dark:text-amber-400" />
          <StatCard label="Approved" value={oppApproved} accent="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Rejected" value={oppRejected} accent="text-red-600 dark:text-red-400" />
          <StatCard label="Closed" value={oppClosed} />
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium mb-2 text-zinc-900 dark:text-white">By type</p>
          <div className="flex flex-wrap gap-3">
            {oppByType.map((t) => (
              <span
                key={t.type}
                className="text-sm px-3 py-1 rounded-full bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300"
              >
                {t.type}: {t._count}
              </span>
            ))}
          </div>
        </div>
        </FadeIn>
      </div>

      <div className="mb-10">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Applications ({totalApplications} total)
        </h2>
        <FadeIn delay={160}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Applied" value={appApplied} />
          <StatCard label="Shortlisted" value={appShortlisted} accent="text-blue-600 dark:text-blue-400" />
          <StatCard label="Selected" value={appSelected} accent="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Rejected" value={appRejected} accent="text-red-600 dark:text-red-400" />
        </div>
        </FadeIn>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Categories
        </h2>
        <FadeIn delay={240}>
        <StatCard label="Total categories" value={totalCategories} />
        </FadeIn>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="glass glass-card rounded-2xl p-4">
      <p className={`text-2xl font-bold ${accent || "text-zinc-900 dark:text-white"}`}>{value}</p>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{label}</p>
    </div>
  );
}