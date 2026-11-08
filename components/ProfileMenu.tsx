"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconChevronDown,
  IconFileText,
  IconLayoutDashboard,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import s from "@/components/site-chrome.module.css";

type ProfileMenuProps = {
  email: string;
  role?: string;
};

// Which links each role gets. Log out is added separately because it is a
// button, not a link.
function profileLinks(role?: string) {
  const links = [{ href: "/dashboard", label: "Dashboard", Icon: IconLayoutDashboard }];

  if (role === "STUDENT") {
    links.push(
      { href: "/profile", label: "Profile", Icon: IconUser },
      { href: "/my-applications", label: "My Applications", Icon: IconFileText }
    );
  } else if (role === "COMPANY") {
    links.push({ href: "/company/profile", label: "Profile", Icon: IconUser });
  }

  return links;
}

function initialsOf(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function Avatar({ email }: { email: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-(--hp-ink) bg-(--hp-purple) text-xs font-extrabold text-white"
    >
      {initialsOf(email)}
    </span>
  );
}

// Focus ring comes from site-chrome.module.css (.chrome :focus-visible); menu rows use .menuItem.

// Desktop: the avatar button and its dropdown
export default function ProfileMenu({ email, role }: ProfileMenuProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState(pathname);
  // Which item takes focus when the menu opens
  const focusOnOpen = useRef<"first" | "last">("first");

  // Close when the page changes
  if (pathname !== openPathname) {
    setOpenPathname(pathname);
    setOpen(false);
  }

  function items() {
    return Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
  }

  function openMenu(target: "first" | "last") {
    focusOnOpen.current = target;
    setOpen(true);
  }

  function closeAndRefocus() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const all = items();
    all[focusOnOpen.current === "first" ? 0 : all.length - 1]?.focus();
  }, [open]);

  // Close on a click outside. Focus returns to the avatar unless the click
  // landed on something else that can hold focus.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      const active = document.activeElement;
      if (active === document.body || rootRef.current?.contains(active)) {
        buttonRef.current?.focus({ preventScroll: true });
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAndRefocus();
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openMenu("first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openMenu("last");
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const all = items();
    const current = all.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        all[(current + 1) % all.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        all[(current - 1 + all.length) % all.length]?.focus();
        break;
      case "Home":
        e.preventDefault();
        all[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        all[all.length - 1]?.focus();
        break;
      case " ":
        // Links only react to Enter by default
        e.preventDefault();
        all[current]?.click();
        break;
      case "Tab":
        // Tab carries on from the avatar, so the menu doesn't trap anyone
        closeAndRefocus();
        break;
    }
  }

  const itemClass = `${s.menuItem} flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-bold`;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu("first"))}
        onKeyDown={onButtonKeyDown}
        className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-(--hp-lavender-soft) ${
          open ? "bg-(--hp-lavender-soft)" : ""
        }`}
      >
        <Avatar email={email} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="profile-menu"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`${s.menuPanel} absolute right-0 top-[calc(100%+10px)] w-64 p-2`}
          >
            <p className="truncate px-3 py-2 text-sm font-semibold text-(--hp-muted)" title={email}>
              {email}
            </p>
            <div className="my-1 border-t-2 border-(--hp-line)" />

            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label="Profile"
              onKeyDown={onMenuKeyDown}
            >
              {profileLinks(role).map(({ href, label, Icon }) => {
                const current = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    tabIndex={-1}
                    aria-current={current ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={itemClass}
                  >
                    <Icon size={18} stroke={2} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}

              <div role="separator" className="my-1 border-t-2 border-(--hp-line)" />

              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => signOut({ callbackUrl: "/" })}
                className={itemClass}
              >
                <IconLogout size={18} stroke={2} aria-hidden="true" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile drawer: the same links, expanded in place under the avatar row.
// The drawer owns `open` so Esc can close this section before the drawer.
export function ProfileDisclosure({
  email,
  role,
  open,
  onOpenChange,
  onLogOut,
}: ProfileMenuProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogOut: () => void;
}) {
  const pathname = usePathname();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // When the section closes around the focused link, give focus back
  useEffect(() => {
    if (wasOpen.current && !open && document.activeElement === document.body) {
      buttonRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  // Close on a click elsewhere in the drawer
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, onOpenChange]);

  const rowClass = `${s.menuItem} flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-3 text-left text-base font-bold`;

  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Profile menu for ${email}`}
        onClick={() => onOpenChange(!open)}
        className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl border-[3px] border-(--hp-ink) bg-white px-2 text-left"
      >
        <Avatar email={email} />
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-(--hp-ink)">{email}</span>
        <IconChevronDown
          size={20}
          stroke={2.4}
          aria-hidden="true"
          className={`shrink-0 text-(--hp-ink) motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <ul id={listId} hidden={!open} className="mt-1">
        {profileLinks(role).map(({ href, label, Icon }) => {
          const current = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={rowClass}
              >
                <Icon size={20} stroke={2} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onLogOut} className={rowClass}>
            <IconLogout size={20} stroke={2} aria-hidden="true" />
            Log out
          </button>
        </li>
      </ul>
    </div>
  );
}
