"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (session?.user) {
    const user = session.user as any;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-bold">Welcome back{user.email ? `, ${user.email}` : ""}</h1>
        <p className="text-zinc-500">
          Role: <span className="font-medium">{user.role}</span>
          {user.status === "PENDING" && (
            <span className="ml-2 text-amber-600">(awaiting admin approval)</span>
          )}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded px-5 py-2 border font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Log out
        </button>
      </div>
    );
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
