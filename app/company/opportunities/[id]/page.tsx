import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditOpportunityForm from "./EditOpportunityForm";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "COMPANY") {
    redirect("/login");
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: user.id },
  });

  if (!companyProfile) {
    redirect("/dashboard");
  }

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
  });

  if (!opportunity || opportunity.companyId !== companyProfile.id) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Edit Opportunity</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        Saving changes will send this back to admin for re-approval.
      </p>
      <EditOpportunityForm categories={categories} opportunity={opportunity} />
    </div>
  );
}
