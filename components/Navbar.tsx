"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import ProfileMenu, { ProfileDisclosure } from "@/components/ProfileMenu";
import s from "@/components/site-chrome.module.css";
import RadiantLogo from "@/components/brand/RadiantLogo";
import { useNavSection } from "@/components/nav-section";
import { SHOW_ABROAD, SHOW_COLLEGES, SHOW_SCHOOL } from "@/lib/features";

// Fonts + colour tokens for the header and the drawer (the drawer renders outside <header>)
const chrome = `${s.chrome}`;

const SCHOLARSHIPS = "/courses/higher-education/after-12th/scholarships";
const INTERNSHIPS = "/courses/higher-education/after-12th/internships";

// "key" says which item a page highlights (Colleges and Courses share /higher; only Colleges lights up)
type NavKey = "school" | "colleges" | "courses" | "exams" | "scholarships" | "internships" | "abroad" | "blog";
const ALL_LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: "school", href: "/school", label: "School" },
  // With SHOW_COLLEGES on, "Colleges" opens the college list; otherwise it stays on /higher
  { key: "colleges", href: SHOW_COLLEGES ? "/colleges" : "/higher", label: "Colleges" },
  { key: "courses", href: "/higher", label: "Courses" },
  { key: "exams", href: "/opportunities", label: "Exams" },
  { key: "scholarships", href: SCHOLARSHIPS, label: "Scholarships" },
  { key: "internships", href: INTERNSHIPS, label: "Internships" },
  { key: "abroad", href: "/abroad", label: "Study abroad" },
  { key: "blog", href: "/blog", label: "Blog" },
];
// Switches (lib/features.ts): School is hidden while SHOW_SCHOOL is off, Study abroad while SHOW_ABROAD is off
const LINKS = ALL_LINKS.filter((l) => (l.key !== "school" || SHOW_SCHOOL) && (l.key !== "abroad" || SHOW_ABROAD));

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const pathname = usePathname();
  const navSection = useNavSection();
  const reduceMotion = useReducedMotion();
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
  const under = (prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");
  // Which menu item this page belongs to
  const activeKey = ((): NavKey | null => {
    // A single post: the page reports its section ("/school", "/higher" or "/opportunities") once loaded
    if (pathname.startsWith("/opportunities/")) {
      if (navSection === "/higher") return "colleges";
      if (navSection === "/school") return "school";
      if (navSection === "/opportunities") return "exams";
      return null;
    }
    if (under("/higher") || (SHOW_COLLEGES && under("/colleges"))) return "colleges";
    if (under("/courses/higher-education")) {
      // Scholarships and internships pages of any level (after 12th, after graduation, ...)
      const stage = pathname.split("/")[4];
      if (stage === "scholarships") return "scholarships";
      if (stage === "internships") return "internships";
      return "colleges";
    }
    // Other course pages (CBSE, ICSE, competitive, vocational): School when it's switched on,
    // otherwise the remaining competitive (exam prep) pages belong to Exams
    if (pathname.startsWith("/courses/")) return SHOW_SCHOOL ? "school" : "exams";
    if (under("/school")) return "school";
    if (under("/opportunities")) return "exams";
    if (under("/abroad")) return "abroad";
    if (under("/blog")) return "blog";
    return null;
  })();
  const homeHref = status === "authenticated" ? "/dashboard" : "/";
  // Drawer slide/fade: instant when the visitor asks for reduced motion
  const drawerTransition = reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" as const };

  return (
    <>
      <header className={`${chrome} ${s.header} sticky top-0 z-50`}>
        {/* The design's breakpoints: links from 1001px, "Log in" from 1181px, menu button below 1001px */}
        <div className={`${s.wrap} ${s.bar}`}>
          {/* Logo 32px tall like the design (mark 44 x 32), 28px on phones; it can shrink at 320px */}
          <Link href={homeHref} className="flex min-w-0 shrink items-center rounded-lg">
            <RadiantLogo className="w-full max-w-[121px] min-[601px]:max-w-[138px]" />
          </Link>

          {/* Desktop links */}
          <nav aria-label="Main" className="hidden items-center gap-0.5 min-[1001px]:flex">
            {LINKS.map((l) => (
              <Link
                key={l.key}
                href={l.href}
                aria-current={activeKey === l.key ? "page" : undefined}
                className={`${s.navLink} min-h-11 px-[13px] text-[15px]`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            {status === "loading" ? null : status === "unauthenticated" ? (
              <>
                <Link
                  href="/login"
                  className={`${s.btn} ${s.btnOut} ${s.loginBtn} h-12 px-[22px] text-base`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={`${s.btn} ${s.btnDark} h-11 px-3.5 text-[15px] min-[601px]:h-12 min-[601px]:px-[22px] min-[601px]:text-base`}
                >
                  Sign up free
                </Link>
              </>
            ) : (
              <div className="hidden min-[1001px]:block">
                <ProfileMenu email={email} role={user?.role} />
              </div>
            )}

            {/* Phones and tablets: menu button */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className={`${s.iconBtn} ${s.menuBtn}`}
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
                <path d="M3 5 h12 M3 9 h12 M3 13 h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              className={`${s.overlay} fixed inset-0 z-[60] min-[1001px]:hidden`}
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
              className={`${chrome} ${s.drawer} fixed top-0 right-0 z-[70] flex h-full w-[85%] max-w-sm flex-col min-[1001px]:hidden`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={drawerTransition}
            >
              <div className={`${s.divider} flex h-[66px] shrink-0 items-center justify-between border-b px-5`}>
                <span className={`${s.display} text-2xl`}>Menu</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={closeMenu}
                  className={s.iconBtn}
                  aria-label="Close menu"
                >
                  <IconX size={20} stroke={2.2} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {LINKS.map((l) => (
                  <Link
                    key={l.key}
                    href={l.href}
                    aria-current={activeKey === l.key ? "page" : undefined}
                    className={`${s.navLink} min-h-[52px] px-4 text-[17px]`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className={`${s.divider} flex max-h-[70%] flex-col gap-3 overflow-y-auto border-t p-5`}>
                {status === "unauthenticated" && (
                  <>
                    <Link
                      href="/login"
                      className={`${s.btn} ${s.btnOut} h-[52px] w-full text-[17px]`}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className={`${s.btn} ${s.btnDark} h-[52px] w-full text-[17px]`}
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
