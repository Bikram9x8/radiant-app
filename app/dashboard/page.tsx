import Link from "next/link";
import { IconChecklist, IconClipboardCheck, IconBuildingSkyscraper, IconCategory, IconUsers, IconKey, IconLockSquareRounded, IconChartBar, IconReportAnalytics, IconHistory, IconListDetails, IconCircleCheck, IconClockHour4, IconX, IconUsersGroup, IconStar } from "@tabler/icons-react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FadeIn from "@/components/FadeIn";
import StudentDashboard from "./StudentDashboard";

function StatCard({
  label,
  value,
  accent,
  Icon,
}: {
  label: string;
  value: number;
  accent?: string;
  Icon?: React.ComponentType<{ size?: number; stroke?: number }>;
}) {
  return (
    <div className="glass glass-card rounded-[18px] px-5 py-6 text-center flex flex-col items-center gap-2">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-tint-teal text-teal-dark flex items-center justify-center mb-1">
          <Icon size={18} stroke={2} />
        </div>
      )}
      <div className={`font-display text-4xl leading-none font-extrabold ${accent ?? "text-ink"}`}>{value}</div>
      <div className="text-xs font-medium text-muted">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  if (user.status === "BLOCKED" || user.status === "REJECTED") {
    redirect("/login");
  }

  if (user.status === "PENDING") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="glass rounded-[18px] px-8 py-10 max-w-md">
          <h1 className="text-2xl font-bold text-ink">Account pending approval</h1>
          <p className="text-muted mt-2">
            Your company account is awaiting admin approval. You&apos;ll be notified once it&apos;s approved.
          </p>
        </div>
      </div>
    );
  }

if (user.role === "STUDENT") {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: {
        fullName: true,
        applications: {
          orderBy: { appliedAt: "desc" },
          take: 3,
          select: {
            id: true,
            status: true,
            appliedAt: true,
            opportunity: {
              select: { id: true, title: true, company: { select: { companyName: true } } },
            },
          },
        },
      },
    });

    return (
      <StudentDashboard
        fullName={studentProfile?.fullName}
        applications={studentProfile?.applications ?? []}
      />
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
          <div className="glass rounded-[18px] px-8 py-10">
            <h1 className="text-2xl font-bold text-ink">Company profile not found</h1>
            <p className="text-muted mt-2">Something went wrong. Please contact support.</p>
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
      APPROVED: "bg-emerald-100/80 text-emerald-700",
      PENDING: "bg-amber-100/80 text-amber-700",
      REJECTED: "bg-red-100/80 text-red-700",
      CLOSED: "bg-zinc-200/80 text-muted",
    };

    return (
      <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-ink">
              {companyProfile.companyName}
            </h1>
            <p className="text-muted mt-2">Here&apos;s how your opportunities are performing.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/company/profile"
              className="rounded-lg px-4 py-2 glass font-semibold text-sm text-ink"
            >
              Edit Company Profile
            </Link>
            <Link
              href="/company/post"
              className="btn-neon rounded-xl px-4 py-2 font-semibold text-sm"
            >
              + Post Opportunity
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: "Total Postings", value: totalOpportunities, accent: "text-teal-dark", Icon: IconListDetails },
            { label: "Live", value: approvedCount, accent: "text-emerald-600", Icon: IconCircleCheck },
            { label: "Pending Review", value: pendingCount, accent: "text-amber-600", Icon: IconClockHour4 },
            { label: "Closed", value: closedCount, accent: "text-muted", Icon: IconX },
            { label: "Total Applicants", value: totalApplicants, accent: "text-cyan-600", Icon: IconUsersGroup },
            { label: "Shortlisted", value: shortlistedCount, accent: "text-lime-600", Icon: IconStar },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 60}>
              <StatCard label={s.label} value={s.value} accent={s.accent} Icon={s.Icon} />
            </FadeIn>
          ))}
        </div>

        <div className="glass rounded-[18px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/20">
            <h2 className="font-semibold text-lg text-ink">Recent Opportunities</h2>
            <Link href="/company/opportunities" className="text-sm text-teal-dark font-semibold hover:underline">
              View all
            </Link>
          </div>

          {recentOpportunities.length === 0 ? (
            <div className="px-5 py-10 text-center text-muted">
              You haven&apos;t posted any opportunities yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-muted border-b border-white/20">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Applicants</th>
                  <th className="px-5 py-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentOpportunities.map((opp) => (
                  <tr key={opp.id} className="border-b border-white/10 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">
                      <Link href={`/company/opportunities/${opp.id}`} className="hover:underline">
                        {opp.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{opp.type}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[opp.status]}`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink">{opp.applications.length}</td>
                    <td className="px-5 py-3 text-muted">
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
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    const adminLinks = [
      { href: "/admin/opportunities", label: "Opportunity Approvals", desc: "Review pending tests", Icon: IconClipboardCheck },
      { href: "/admin/companies", label: "Company Approvals", desc: "Review new company signups", Icon: IconBuildingSkyscraper },
      { href: "/admin/mcq", label: "MCQ Tests", desc: "Build chapter tests and manage the question bank", Icon: IconChecklist },
      { href: "/admin/categories", label: "Categories", desc: "Manage subjects and exams", Icon: IconCategory },
      { href: "/admin/users", label: "Users", desc: "View and manage accounts", Icon: IconUsers },
      { href: "/admin/access-codes", label: "Access Codes", desc: "Generate and manage test access codes", Icon: IconKey },
      { href: "/admin/locked-tests", label: "Locked Tests", desc: "Review and unlock students locked out of tests", Icon: IconLockSquareRounded },
      { href: "/admin/stats", label: "Stats", desc: "Platform overview", Icon: IconChartBar },
      { href: "/admin/insights", label: "Insights", desc: "Student activity, data health and site traffic", Icon: IconReportAnalytics },
      { href: "/admin/logs", label: "Activity Log", desc: "Recent admin actions", Icon: IconHistory },
    ];

    return (
      <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-1">Admin Dashboard</h1>
        <p className="text-muted mb-8">Manage approvals, users, and platform content.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link, i) => (
            <FadeIn key={link.href} delay={i * 60}>
              <Link
                href={link.href}
                className="glass glass-card block rounded-[18px] p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-tint-teal text-teal-dark flex items-center justify-center">
                  <link.Icon size={22} stroke={2} />
                </div>
                <div>
                  <p className="font-semibold text-ink">{link.label}</p>
                  <p className="text-sm text-muted mt-1">{link.desc}</p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
