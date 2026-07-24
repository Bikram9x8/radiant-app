import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccessCodesManager from "./AccessCodesManager";

export default async function AccessCodesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { requiresCode: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Access Codes</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        Generate access codes for tests that require them.
      </p>
      <AccessCodesManager opportunities={opportunities} />
    </div>
  );
}
