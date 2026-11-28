"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import AuthLink from "@/components/auth/AuthLink";
import { SHOW_SCHOOL } from "@/lib/features";

// Shared look for the login and signup pages (Phase 2 calm style): tinted illustration panel on
// the left (a short banner on phones) and a white form card on the right.
// The panel pieces (authPanels, StudyArt, AuthBenefits) are also used by AuthModal.

export const authPanels = {
  login: {
    background: "var(--tint-teal)",
    heading: "Learn, practise and find internships — all in one place.",
    benefits: [
      // No "Class 12" while School Education is switched off (lib/features.ts)
      SHOW_SCHOOL ? "Free Class 12 and entrance exam practice tests" : "Free entrance exam practice tests",
      "Latest internships and openings, checked at the source",
      "Track your progress and applications",
    ],
  },
  signup: {
    background: "var(--tint-peach)",
    heading: "Your free account takes less than a minute.",
    benefits: [
      "No fees — practice tests are free",
      "Apply to internships in a few clicks",
      "Pick up where you left off on any device",
    ],
  },
};

// Shared input + label styles so every auth form looks the same
export const authLabel = "block text-sm font-semibold text-ink mb-1.5";
export const authInput =
  "w-full min-h-[46px] rounded-xl border-[1.5px] border-btn-line bg-white px-4 py-2.5 text-ink placeholder:text-muted outline-none hover:border-[#b8c4d1] focus:border-teal focus:ring-3 focus:ring-teal/25";
export const authButton =
  "w-full min-h-[48px] rounded-full bg-teal px-4 py-3 font-bold text-white shadow-[0_8px_20px_-10px_rgb(15_118_110/0.6)] hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:opacity-60";
export const authLink = "font-bold text-teal-dark underline-offset-4 hover:underline";

export default function AuthLayout({
  variant,
  children,
}: {
  variant: "login" | "signup";
  children: React.ReactNode;
}) {
  const panel = authPanels[variant];

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 lg:min-h-[640px]">
      <aside
        style={{ background: panel.background }}
        className="px-6 pt-6 pb-16 lg:p-12 lg:flex lg:items-center lg:justify-center"
      >
        <div className="mx-auto w-full max-w-md grid grid-cols-[1fr_auto] items-center gap-x-4 lg:grid-cols-1 lg:gap-y-8">
          <StudyArt className="col-start-2 row-start-1 w-24 sm:w-32 lg:col-start-1 lg:w-full lg:max-w-sm" />

          <p className="col-start-1 row-start-1 font-display text-[26px] leading-[0.95] font-extrabold uppercase text-ink lg:row-start-2 lg:text-5xl">
            {panel.heading}
          </p>

          <AuthBenefits variant={variant} className="hidden lg:flex lg:row-start-3 flex-col gap-3" />
        </div>
      </aside>

      <main className="flex justify-center px-4 pb-12 lg:items-start lg:px-12 lg:py-20">
        <div className="relative z-10 -mt-10 w-full max-w-[420px] rounded-[18px] border border-line bg-white p-6 shadow-soft sm:p-8 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}

// The three benefit lines with check marks; className sets layout and visibility
export function AuthBenefits({ variant, className }: { variant: "login" | "signup"; className: string }) {
  return (
    <ul className={className}>
      {authPanels[variant].benefits.map((b) => (
        <li key={b} className="flex items-start gap-3 text-muted">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-teal-dark">
            <IconCheck size={16} stroke={2.5} aria-hidden="true" />
          </span>
          {b}
        </li>
      ))}
    </ul>
  );
}

// Student / Company switch for the signup pages. Each option is a real link
// to its own page; the current one is highlighted and marked aria-current.
export function SignupSwitch({ current }: { current: "student" | "company" }) {
  const options = [
    { key: "student", label: "Student", href: "/signup" },
    { key: "company", label: "Company", href: "/signup/company" },
  ] as const;

  return (
    <nav aria-label="Account type" className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-[#f1f5f9] p-1">
      {options.map((o) => {
        const active = o.key === current;
        return (
          <AuthLink
            key={o.key}
            href={o.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-full text-sm font-bold ${
              active
                ? "bg-white text-ink shadow-soft"
                : "text-muted hover:text-teal-dark"
            }`}
          >
            {o.label}
          </AuthLink>
        );
      })}
    </nav>
  );
}

// Password input with a Show/Hide toggle
export function PasswordField({
  id,
  value,
  onChange,
  minLength,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={authLabel}>
        Password
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className={`${authInput} pr-20`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-controls={id}
          aria-label="Show password"
          className="absolute inset-y-0 right-0 min-w-[44px] px-4 text-sm font-semibold text-teal-dark hover:underline"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

// Line-art study scene: laptop, stack of books, graduation cap, small plant
export function StudyArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="#0f2e33"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="160" cy="112" r="96" fill="#ffffff" stroke="none" opacity="0.6" />
      {/* desk */}
      <line x1="16" y1="196" x2="304" y2="196" />

      {/* stack of books */}
      <rect x="28" y="172" width="78" height="24" rx="4" fill="#fde68a" />
      <rect x="36" y="148" width="66" height="24" rx="4" fill="#bbf7d0" />
      <rect x="30" y="124" width="72" height="24" rx="4" fill="#fed7aa" />
      <line x1="40" y1="184" x2="96" y2="184" />
      <line x1="46" y1="160" x2="92" y2="160" />
      <line x1="40" y1="136" x2="92" y2="136" />

      {/* graduation cap on the books */}
      <polygon points="66,92 104,106 66,120 28,106" fill="#99f6e4" />
      <path d="M44 112 v10 c0 6 44 6 44 0 v-10" fill="#99f6e4" />
      <path d="M104 106 v18" />
      <circle cx="104" cy="127" r="3" fill="#fde68a" />

      {/* laptop */}
      <rect x="126" y="98" width="110" height="74" rx="6" fill="#ffffff" />
      <rect x="136" y="108" width="90" height="54" rx="3" fill="#ccfbf1" />
      <path d="M114 196 l12 -24 h110 l12 24 z" fill="#dff7f4" />
      <line x1="166" y1="186" x2="196" y2="186" />
      <line x1="148" y1="122" x2="190" y2="122" />
      <line x1="148" y1="134" x2="212" y2="134" />
      <line x1="148" y1="146" x2="178" y2="146" />

      {/* small plant */}
      <path d="M262 196 l-6 -32 h36 l-6 32 z" fill="#fed7aa" />
      <path d="M274 164 v-28" />
      <path d="M274 148 c-14 -2 -20 -12 -20 -22 c12 0 20 8 20 22 z" fill="#bbf7d0" />
      <path d="M274 140 c12 -2 18 -12 18 -22 c-11 0 -18 8 -18 22 z" fill="#bbf7d0" />
    </svg>
  );
}
