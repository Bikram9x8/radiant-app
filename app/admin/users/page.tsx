import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserManager from "./UserManager";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      studentProfile: { select: { fullName: true } },
      companyProfile: { select: { companyName: true } },
    },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Users</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">{users.length} total</p>
      <UserManager users={users} currentUserId={currentUser.id} />
    </div>
  );
}