import Link from "next/link";
import { IconFileText, IconTool, IconTargetArrow, IconPackage, IconClipboardList, IconSchool, IconBook } from "@tabler/icons-react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    <div className="glass rounded-3xl px-5 py-6 text-center">
      <div className={`text-3xl font-bold ${accent ?? "text-zinc-900 dark:text-white"}`}>{value}</div>
      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-2">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  if (user.status === "BLOCKED" || user.status === "REJECTED") {
    redirect("/login");
  }

  if (user.status === "PENDING") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="glass rounded-2xl px-8 py-10 max-w-md">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Account pending approval</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Your company account is awaiting admin approval. You'll be notified once it's approved.
          </p>
        </div>
      </div>
    );
  }

if (user.role === "STUDENT") {
    const studentTiles = [
      { href: "/opportunities", label: "Test Series", Icon: IconFileText, gradient: "from-emerald-400 to-cyan-400", glow: "shadow-[0_0_16px_rgba(52,211,153,0.5)]" },
      { href: "/opportunities?division=SKILL_BUILDING", label: "Skill Building", Icon: IconTool, gradient: "from-pink-400 to-purple-400", glow: "shadow-[0_0_16px_rgba(244,114,182,0.5)]" },
      { href: "/opportunities?division=CAREER_COUNSELING", label: "Career Counseling", Icon: IconTargetArrow, gradient: "from-cyan-400 to-blue-400", glow: "shadow-[0_0_16px_rgba(34,211,238,0.5)]" },
      { href: "/opportunities?division=STUDY_PACKAGE", label: "Study Package", Icon: IconPackage, gradient: "from-lime-400 to-emerald-400", glow: "shadow-[0_0_16px_rgba(163,230,53,0.5)]" },
      { href: "/opportunities?division=DPP", label: "DPP", Icon: IconClipboardList, gradient: "from-amber-400 to-pink-400", glow: "shadow-[0_0_16px_rgba(251,191,36,0.5)]" },
      { href: "/opportunities?division=BOARD_LEVEL_TEST", label: "Board Level Test", Icon: IconSchool, gradient: "from-emerald-400 to-purple-400", glow: "shadow-[0_0_16px_rgba(52,211,153,0.5)]" },
      { href: "/opportunities?division=CHAPTER_WISE_TEST", label: "Chapter Wise Test", Icon: IconBook, gradient: "from-purple-400 to-pink-400", glow: "shadow-[0_0_16px_rgba(192,132,252,0.5)]" },
    ];

    return (
      <div className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
            Unlock Your Full Potential
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">Practice tests, career tools, and more — all in one place.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {studentTiles.map((tile) => (
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

        <div className="flex gap-3">
          <Link
            href="/profile"
            className="rounded-xl px-5 py-2.5 glass font-semibold text-sm text-zinc-900 dark:text-white"
          >
            Edit My Profile
          </Link>
          <Link
            href="/my-applications"
            className="rounded-xl px-5 py-2.5 glass font-semibold text-sm text-zinc-900 dark:text-white"
          >
            My Applications
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "COMPANY") {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: user.id },
      include: {
        opportunities: {
          include: { applications: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!companyProfile) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="glass rounded-2xl px-8 py-10">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Company profile not found</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">Something went wrong. Please contact support.</p>
          </div>
        </div>
      );
    }

    const opportunities = companyProfile.opportunities;
    const totalOpportunities = opportunities.length;
    const approvedCount = opportunities.filter((o) => o.status === "APPROVED").length;
    const pendingCount = opportunities.filter((o) => o.status === "PENDING").length;
    const closedCount = opportunities.filter((o) => o.status === "CLOSED").length;

    const allApplications = opportunities.flatMap((o) => o.applications);
    const totalApplicants = allApplications.length;
    const shortlistedCount = allApplications.filter((a) => a.status === "SHORTLISTED").length;

    const recentOpportunities = opportunities.slice(0, 5);

    const statusStyles: Record<string, string> = {
      APPROVED: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      PENDING: "bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      REJECTED: "bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-300",
      CLOSED: "bg-zinc-200/80 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400",
    };

    return (
      <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {companyProfile.companyName}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">Here's how your opportunities are performing.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/company/profile"
              className="rounded-lg px-4 py-2 glass font-semibold text-sm text-zinc-900 dark:text-white"
            >
              Edit Company Profile
            </Link>
            <Link
              href="/company/post"
              className="rounded-lg px-4 py-2 bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors"
            >
              + Post Opportunity
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard label="Total Postings" value={totalOpportunities} />
          <StatCard label="Live" value={approvedCount} accent="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Pending Review" value={pendingCount} accent="text-amber-600 dark:text-amber-400" />
          <StatCard label="Closed" value={closedCount} accent="text-zinc-500" />
          <StatCard label="Total Applicants" value={totalApplicants} accent="text-blue-600 dark:text-blue-400" />
          <StatCard label="Shortlisted" value={shortlistedCount} accent="text-purple-600 dark:text-purple-400" />
        </div>

        <div className="glass rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/20 dark:border-white/10">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white">Recent Opportunities</h2>
            <Link href="/company/opportunities" className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              View all
            </Link>
          </div>

          {recentOpportunities.length === 0 ? (
            <div className="px-5 py-10 text-center text-zinc-600 dark:text-zinc-400">
              You haven't posted any opportunities yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-600 dark:text-zinc-400 border-b border-white/20 dark:border-white/10">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Applicants</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentOpportunities.map((opp) => (
                  <tr key={opp.id} className="border-b border-white/10 dark:border-white/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">
                      <Link href={`/company/opportunities/${opp.id}`} className="hover:underline">
                        {opp.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{opp.type}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[opp.status]}`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-900 dark:text-white">{opp.applications.length}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                      {opp.applyDeadline.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    const adminLinks = [
      { href: "/admin/opportunities", label: "Opportunity Approvals", desc: "Review pending tests" },
      { href: "/admin/companies", label: "Company Approvals", desc: "Review new company signups" },
      { href: "/admin/categories", label: "Categories", desc: "Manage subjects and exams" },
      { href: "/admin/users", label: "Users", desc: "View and manage accounts" },
      { href: "/admin/access-codes", label: "Access Codes", desc: "Generate and manage test access codes" },
      { href: "/admin/locked-tests", label: "Locked Tests", desc: "Review and unlock students locked out of tests" },
      { href: "/admin/stats", label: "Stats", desc: "Platform overview" },
      { href: "/admin/logs", label: "Activity Log", desc: "Recent admin actions" },
    ];

    return (
      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Admin Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">Manage approvals, users, and platform content.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass rounded-2xl p-5 hover:scale-[1.02] transition-transform"
            >
              <p className="font-semibold text-zinc-900 dark:text-white">{link.label}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
