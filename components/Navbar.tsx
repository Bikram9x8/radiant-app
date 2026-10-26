"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";

const LINKS = [
  { href: "/school", label: "School Education" },
  { href: "/higher", label: "Higher Education" },
  { href: "/opportunities", label: "Tests" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  // Close the mobile menu when the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Stop the page behind the menu from scrolling, and close on Escape
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const homeHref = status === "authenticated" ? "/dashboard" : "/";

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white border-b border-[#e4e2ef]"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center shrink-0">
            <img src="/logo-light.png" alt="Radiant Educations" className="h-10 w-auto" />
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-300 ${
                  isActive(l.href)
                    ? "bg-violet-100 text-[#5b33d6]"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-[#5b33d6]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? null : status === "unauthenticated" ? (
              <>
                <Link
                  href="/login"
                  className="btn btn-secondary"
                  style={{ minHeight: 40, padding: "0.5rem 1.1rem" }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary"
                  style={{ minHeight: 40, padding: "0.5rem 1.1rem" }}
                >
                  Sign up free
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="btn btn-secondary"
                  style={{ minHeight: 40, padding: "0.5rem 1.1rem" }}
                >
                  Dashboard
                </Link>
                <div className="w-9 h-9 rounded-full bg-[#5b33d6] text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
              </>
            )}
          </div>

          {/* Hamburger (phones and tablets) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-xl hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <span className="h-[2px] w-6 rounded-full bg-[#14142b]" />
            <span className="h-[2px] w-6 rounded-full bg-[#14142b]" />
            <span className="h-[2px] w-6 rounded-full bg-[#14142b]" />
          </button>
        </div>
      </header>

      {/* Mobile menu: slides in from the right */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-[60] bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              key="drawer"
              className="fixed top-0 right-0 z-[70] h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="h-16 px-5 flex items-center justify-between border-b border-[#e4e2ef]">
                <span className="text-lg font-extrabold text-[#14142b]">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-zinc-100"
                  aria-label="Close menu"
                >
                  <IconX size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors duration-300 ${
                      isActive(l.href)
                        ? "bg-violet-100 text-[#5b33d6]"
                        : "text-zinc-800 hover:bg-zinc-100"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="p-5 border-t border-[#e4e2ef] flex flex-col gap-3">
                {status === "unauthenticated" && (
                  <>
                    <Link href="/login" className="btn btn-secondary w-full">
                      Log in
                    </Link>
                    <Link href="/signup" className="btn btn-primary w-full">
                      Sign up free
                    </Link>
                  </>
                )}
                {status === "authenticated" && (
                  <>
                    <Link href="/dashboard" className="btn btn-secondary w-full">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="btn w-full text-red-600 border border-red-200 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}