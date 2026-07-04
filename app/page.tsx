import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Radiant Educations</h1>
        <p className="text-lg text-zinc-500 max-w-xl">
          Connecting students with internships, jobs, and opportunities from verified companies.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="rounded px-6 py-3 bg-blue-700 text-white font-semibold hover:bg-blue-800"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded px-6 py-3 border font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Sign up as Student
        </Link>
        <Link
          href="/signup/company"
          className="rounded px-6 py-3 border font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Sign up as Company
        </Link>
      </div>
    </div>
  );
}
