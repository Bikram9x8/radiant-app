"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import ProfileMenu, { ProfileDisclosure } from "@/components/ProfileMenu";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/site-chrome.module.css";
import RadiantLogo from "@/components/brand/RadiantLogo";

// Fonts + colour tokens for the header and the drawer (the drawer renders outside <header>)
const chrome = `${fredoka.variable} ${nunito.variable} ${s.chrome}`;

const LINKS = [
  { href: "/school", label: "School Education" },
  { href: "/higher", label: "Higher Education" },
  { href: "/opportunities", label: "Tests" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerWasOpen = useRef(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, []);

  useEffect(() => {
    setVisible(true);
  }, []);

  // Close the mobile menu when the page changes
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Stop the page behind the menu from scrolling
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Move focus into the drawer when it opens, and back when it closes
  useEffect(() => {
    if (menuOpen) closeRef.current?.focus();
    else if (drawerWasOpen.current) hamburgerRef.current?.focus();
    drawerWasOpen.current = menuOpen;
  }, [menuOpen]);

  // Inside the drawer: Escape closes the profile section first, then the
  // drawer, and Tab stays inside until the drawer is closed
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (profileOpen) setProfileOpen(false);
        else closeMenu();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      ).filter((el) => el.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, profileOpen, closeMenu]);

  const email: string = user?.email ?? "";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const homeHref = status === "authenticated" ? "/dashboard" : "/";
  // Drawer slide/fade: instant when the visitor asks for reduced motion
  const drawerTransition = reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" as const };

  return (
    <>
      <header
        className={`${chrome} ${s.header} sticky top-0 z-50`}
        style={{ opacity: visible ? 1 : 0, transition: reduceMotion ? "none" : "opacity 0.5s ease-in-out" }}
      >
        {/* Desktop layout from lg (1024px): logo + 3 nav pills + 2 buttons need ~930px */}
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-8 lg:h-20 lg:gap-6">
          {/* Compact logo. Phones/tablets: no EDUCATIONS, sized by width so it shrinks to fit at 320px
              (max 160px wide = 44px tall). Desktop: with EDUCATIONS, 60px tall in the 80px bar.
              The plane flies once on page load; still when reduced motion is on. */}
          <Link href={homeHref} className="flex min-w-0 flex-1 items-center rounded-xl lg:flex-none">
            <span className="flex w-full min-w-0 lg:hidden">
              <RadiantLogo compact edu={false} animated once className="w-full max-w-[160px]" />
            </span>
            <span className="hidden lg:flex">
              <RadiantLogo compact animated once className="h-[60px]" />
            </span>
          </Link>

          {/* Desktop links */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`${s.navLink} h-11 px-4 text-[15px]`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-2 lg:flex">
            {status === "loading" ? null : status === "unauthenticated" ? (
              <>
                <Link
                  href="/login"
                  className={`${s.flat} flex h-11 items-center rounded-full border-[3px] border-(--hp-ink) bg-white px-5 font-extrabold text-(--hp-ink) no-underline`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={`${s.flat} flex h-11 items-center rounded-full bg-(--hp-ink) px-5 font-extrabold text-white no-underline`}
                >
                  Sign up free
                </Link>
              </>
            ) : (
              <ProfileMenu email={email} role={user?.role} />
            )}
          </div>

          {/* Phones and tablets: sign-up pill (logged out) + hamburger */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {status === "unauthenticated" && (
              <Link
                href="/signup"
                className={`${s.flat} flex h-11 items-center rounded-full bg-(--hp-ink) px-4 text-[15px] font-extrabold whitespace-nowrap text-white no-underline`}
              >
                Sign up free
              </Link>
            )}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`${s.flat} flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-(--hp-ink) bg-white`}
              aria-label="Open menu"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
                <path
                  d="M3 5 h12 M3 9 h12 M3 13 h12"
                  stroke="var(--hp-ink)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: slides in from the right */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              className={`${s.overlay} fixed inset-0 z-[60] lg:hidden`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={drawerTransition}
              onClick={closeMenu}
            />
            <motion.aside
              key="drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className={`${chrome} ${s.drawer} fixed top-0 right-0 z-[70] flex h-full w-[85%] max-w-sm flex-col lg:hidden`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={drawerTransition}
            >
              <div className="flex h-[68px] shrink-0 items-center justify-between border-b-[3px] border-(--hp-ink) px-5">
                <span className={`${s.display} text-[22px] font-bold`}>Menu</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={closeMenu}
                  className={`${s.flat} flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-(--hp-ink) bg-white`}
                  aria-label="Close menu"
                >
                  <IconX size={20} stroke={2.6} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Main" className="flex flex-1 flex-col gap-2 overflow-y-auto p-5">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={`${s.navLink} min-h-[52px] px-5 text-lg`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="flex max-h-[70%] flex-col gap-3 overflow-y-auto border-t-[3px] border-(--hp-ink) p-5">
                {status === "unauthenticated" && (
                  <>
                    <Link
                      href="/login"
                      className={`${s.flat} flex h-[52px] w-full items-center justify-center rounded-full border-[3px] border-(--hp-ink) bg-white text-[17px] font-extrabold text-(--hp-ink) no-underline`}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className={`${s.flat} flex h-[52px] w-full items-center justify-center rounded-full bg-(--hp-ink) text-[17px] font-extrabold text-white no-underline`}
                    >
                      Sign up free
                    </Link>
                  </>
                )}
                {status === "authenticated" && (
                  <ProfileDisclosure
                    email={email}
                    role={user?.role}
                    open={profileOpen}
                    onOpenChange={setProfileOpen}
                    onLogOut={() => {
                      closeMenu();
                      signOut({ callbackUrl: "/" });
                    }}
                  />
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
