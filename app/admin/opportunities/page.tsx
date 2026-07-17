import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApprovalTable from "./ApprovalTable";

export default async function AdminOpportunitiesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { status: "PENDING" },
    include: {
      company: { select: { companyName: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Opportunity Approvals</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        {opportunities.length} pending review
      </p>
      <ApprovalTable opportunities={opportunities} />
    </div>
  );
}