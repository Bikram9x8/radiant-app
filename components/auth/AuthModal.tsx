"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { InAuthModalContext } from "@/components/auth/AuthLink";
import { AuthBenefits, StudyArt, authPanels } from "@/components/AuthLayout";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Switching between login and signup swaps one modal for another, so the
// element that first opened the modal is kept here and focused again only
// once no modal is left open.
let openModals = 0;
let opener: HTMLElement | null = null;

// Floating card for the login/signup forms, shown over the current page.
// Closes with the X button, Escape or a click on the backdrop.
// From md up: illustration panel on the left, form on the right. On phones the
// panel is a short banner (heading + small illustration) above the form.
export default function AuthModal({
  label,
  variant,
  children,
}: {
  label: string;
  variant: "login" | "signup";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const panel = authPanels[variant];
  const dialogRef = useRef<HTMLDivElement>(null);
  const pressedBackdrop = useRef(false);
  const close = useCallback(() => router.back(), [router]);

  // Lock page scroll, move focus into the modal, restore both on close
  useEffect(() => {
    // Kept until the last modal has closed, so a modal replacing another
    // (or React remounting it in development) doesn't overwrite it
    if (!opener) opener = document.activeElement as HTMLElement | null;
    openModals++;
    const html = document.documentElement;
    html.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const firstInput = dialog?.querySelector<HTMLElement>("input");
    // Phones would pop up the keyboard, so there focus goes to the card itself
    if (firstInput && window.matchMedia("(pointer: fine)").matches) firstInput.focus();
    else dialog?.focus();

    return () => {
      openModals--;
      setTimeout(() => {
        if (openModals > 0) return;
        html.style.overflow = "";
        if (opener?.isConnected) opener.focus();
        opener = null;
      });
    };
  }, []);

  // Escape closes; Tab and Shift+Tab stay inside the modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#14142b]/50 p-3 sm:p-6"
      onMouseDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        // Only a click that starts and ends on the backdrop closes the modal,
        // so selecting text and releasing outside the card doesn't
        if (pressedBackdrop.current && e.target === e.currentTarget) close();
        pressedBackdrop.current = false;
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="relative grid max-h-full w-full max-w-[440px] overflow-y-auto overscroll-contain rounded-[16px] bg-white shadow-[0_24px_64px_rgba(20,20,43,0.25)] outline-none md:max-w-[860px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-[#3b3a55] hover:bg-[#f6f5fb] hover:text-[#14142b] focus-visible:outline-2 focus-visible:outline-[#6d28d9]"
        >
          <IconX size={22} aria-hidden="true" />
        </button>

        <aside
          style={{ background: panel.background }}
          className="grid grid-cols-[1fr_auto] items-center gap-x-4 py-4 pl-6 pr-14 sm:pl-8 md:grid-cols-1 md:content-center md:gap-y-6 md:p-10"
        >
          <StudyArt className="col-start-2 row-start-1 w-20 md:col-start-1 md:mx-auto md:w-full md:max-w-[260px]" />
          <p className="col-start-1 row-start-1 text-base font-bold leading-snug text-[#14142b] md:row-start-2 md:text-2xl md:tracking-tight">
            {panel.heading}
          </p>
          <AuthBenefits variant={variant} className="hidden flex-col gap-3 text-sm md:row-start-3 md:flex" />
        </aside>

        <div className="p-6 sm:p-8 md:pt-14">
          <InAuthModalContext.Provider value={true}>{children}</InAuthModalContext.Provider>
        </div>
      </div>
    </div>
  );
}
