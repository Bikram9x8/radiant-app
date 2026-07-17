"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "";

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-zinc-900 dark:text-white">
          Radiant<span className="text-purple-600 dark:text-purple-400">Educations</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/opportunities"
            className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Tests
          </Link>

          {status === "loading" ? null : status === "unauthenticated" ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Sign up free
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Log out
              </button>
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
