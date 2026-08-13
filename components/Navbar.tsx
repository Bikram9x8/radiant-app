"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { IconFileText, IconTool, IconTargetArrow, IconPackage, IconClipboardList, IconSchool, IconBook, IconBook2, IconChevronDown } from "@tabler/icons-react";

const DIVISIONS = [
  { href: "/opportunities?division=NCERT_SOLUTION", label: "NCERT Solution", Icon: IconBook2, gradient: "from-indigo-400 to-purple-400" },
  { href: "/opportunities", label: "Test Series", Icon: IconFileText, gradient: "from-emerald-400 to-cyan-400" },
  { href: "/opportunities?division=SKILL_BUILDING", label: "Skill Building", Icon: IconTool, gradient: "from-pink-400 to-purple-400" },
  { href: "/opportunities?division=CAREER_COUNSELING", label: "Career Counseling", Icon: IconTargetArrow, gradient: "from-cyan-400 to-blue-400" },
  { href: "/opportunities?division=STUDY_PACKAGE", label: "Study Package", Icon: IconPackage, gradient: "from-lime-400 to-emerald-400" },
  { href: "/opportunities?division=DPP", label: "DPP", Icon: IconClipboardList, gradient: "from-amber-400 to-pink-400" },
  { href: "/opportunities?division=BOARD_LEVEL_TEST", label: "Board Level Test", Icon: IconSchool, gradient: "from-emerald-400 to-purple-400" },
  { href: "/opportunities?division=CHAPTER_WISE_TEST", label: "Chapter Wise Test", Icon: IconBook, gradient: "from-purple-400 to-pink-400" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [divisionsOpen, setDivisionsOpen] = useState(false);
  const divisionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (divisionsRef.current && !divisionsRef.current.contains(e.target as Node)) {
        setDivisionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            className="w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            aria-label="Menu"
          >
            <span
              className={`h-[2px] w-6 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(155,60,255,0.8)] transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`h-[2px] w-6 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(155,60,255,0.8)] transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[2px] w-6 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(155,60,255,0.8)] transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
            <Link href={status === "authenticated" ? "/dashboard" : "/"} className="flex items-center">
            <img src="/logo-light.png" alt="Radiant Educations" className="h-11 w-auto dark:hidden" />
            <img src="/logo-dark.png" alt="Radiant Educations" className="h-11 w-auto hidden dark:block" />
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <div className="relative hidden sm:block" ref={divisionsRef}>
            <button
              onClick={() => setDivisionsOpen(!divisionsOpen)}
              className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Explore
              <IconChevronDown size={14} className={`transition-transform ${divisionsOpen ? "rotate-180" : ""}`} />
            </button>
            {divisionsOpen && (
              <div className="absolute top-full right-0 mt-3 glass rounded-2xl p-3 grid grid-cols-2 gap-1 w-72 z-50">
                {DIVISIONS.map((d) => (
                  <Link
                    key={d.label}
                    href={d.href}
                    onClick={() => setDivisionsOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${d.gradient} flex items-center justify-center shrink-0`}>
                      <d.Icon size={13} color="white" stroke={2.5} />
                    </div>
                    {d.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {status === "loading" ? null : status === "unauthenticated" ? (
            <Link
              href="/signup"
              className="btn-neon text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Sign up free
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 shadow-[0_0_10px_rgba(155,60,255,0.4)] text-white flex items-center justify-center text-xs font-semibold">
              {initials}
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