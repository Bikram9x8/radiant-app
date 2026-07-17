import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { opportunities: true } },
    },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Categories</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        Subjects and exams companies/data-entry can post opportunities under.
      </p>
      <CategoryManager categories={categories} />
    </div>
  );
}