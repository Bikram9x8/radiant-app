import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompanyApprovalTable from "./CompanyApprovalTable";

export default async function AdminCompaniesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const pendingCompanies = await prisma.user.findMany({
    where: { role: "COMPANY", status: "PENDING" },
    include: {
      companyProfile: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Company Approvals</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        {pendingCompanies.length} pending review
      </p>
      <CompanyApprovalTable companies={pendingCompanies} />
    </div>
  );
}