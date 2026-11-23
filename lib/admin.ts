import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Server-side admin check for admin pages. The session (JWT) can be up to 30 days old, so the
// role and status are re-read from the database: a demoted or blocked admin is sent to /login
// straight away instead of when their token expires. Returns the admin's id.
export async function requireAdmin(): Promise<{ id: string }> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;

  if (!sessionUser || sessionUser.role !== "ADMIN" || !sessionUser.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.role !== "ADMIN" || user.status !== "APPROVED") {
    redirect("/login");
  }

  return { id: user.id };
}
