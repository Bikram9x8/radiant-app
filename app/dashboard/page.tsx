import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

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
        <h1 className="text-2xl font-bold">Account pending approval</h1>
        <p className="text-zinc-500 max-w-md">
          Your company account is awaiting admin approval. You'll be notified once it's approved.
        </p>
      </div>
    );
  }

if (user.role === "STUDENT") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-zinc-500">Welcome, {user.email}.</p>
        <Link href="/profile" className="rounded px-5 py-2 bg-blue-700 text-white font-semibold hover:bg-blue-800">
          Edit My Profile
        </Link>
      </div>
    );
  }

  if (user.role === "COMPANY") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Company Dashboard</h1>
        <p className="text-zinc-500">Coming in Day 4 — post opportunities, manage applicants.</p>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-zinc-500">Coming in Day 5 — approvals, user management, stats.</p>
      </div>
    );
  }

  return null;
}
