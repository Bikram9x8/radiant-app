"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "";

  return (
    <header
      className="relative sticky top-0 z-50 bg-white dark:bg-black"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        className="absolute left-0 right-0 -bottom-6 h-6 pointer-events-none bg-gradient-to-b from-white dark:from-black to-transparent"
      />
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
          <Link href={status === "authenticated" ? "/dashboard" : "/"} className="font-bold text-lg text-zinc-900 dark:text-white">
            Radiant
            <span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Educations
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/opportunities"
            className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
                className="btn-neon text-sm font-semibold px-4 py-2 rounded-xl"
              >
                Sign up free
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Log out
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 shadow-[0_0_10px_rgba(155,60,255,0.4)] text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
            </div>
          )}
        </nav>
      </div>

      {menuOpen && (
        <div className="glass mx-4 mb-4 rounded-2xl p-4 flex flex-col gap-1">
          <Link
            href="/opportunities"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            Tests
          </Link>
          {status === "authenticated" && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Log out
              </button>
            </>
          )}
          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}