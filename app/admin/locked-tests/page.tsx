import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LockedTestsManager from "./LockedTestsManager";

export default async function LockedTestsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Locked Tests</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        Students who got locked out of a code-gated test for switching tabs or apps.
      </p>
      <LockedTestsManager />
    </div>
  );
}