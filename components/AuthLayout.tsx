"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import AuthLink from "@/components/auth/AuthLink";

// Shared look for the login and signup pages: pastel illustration panel on
// the left (a short banner on phones) and a white form card on the right.

const PANELS = {
  login: {
    background: "#ede9fe",
    heading: "Learn, practise and find internships — all in one place.",
    benefits: [
      "Free Class 12 and entrance exam practice tests",
      "Internships from verified companies",
      "Track your progress and applications",
    ],
  },
  signup: {
    background: "#e0f2fe",
    heading: "Your free account takes less than a minute.",
    benefits: [
      "No fees — practice tests are free",
      "Apply to internships in a few clicks",
      "Pick up where you left off on any device",
    ],
  },
};

// Shared input + label styles so every auth form looks the same
export const authLabel = "block text-sm font-semibold text-[#14142b] mb-1.5";
export const authInput =
  "w-full min-h-[44px] rounded-xl border border-[#d4d4d8] bg-white px-4 py-2.5 text-[#14142b] placeholder:text-zinc-500 outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-[#6d28d9]/25";
export const authButton =
  "w-full min-h-[48px] rounded-xl bg-[#6d28d9] px-4 py-3 font-semibold text-white hover:bg-[#5b21b6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d28d9] disabled:opacity-60";
export const authLink = "font-semibold text-[#6d28d9] hover:underline";

export default function AuthLayout({
  variant,
  children,
}: {
  variant: "login" | "signup";
  children: React.ReactNode;
}) {
  const panel = PANELS[variant];

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 lg:min-h-[640px]">
      <aside
        style={{ background: panel.background }}
        className="px-6 pt-6 pb-16 lg:p-12 lg:flex lg:items-center lg:justify-center"
      >
        <div className="mx-auto w-full max-w-md grid grid-cols-[1fr_auto] items-center gap-x-4 lg:grid-cols-1 lg:gap-y-8">
          <StudyArt className="col-start-2 row-start-1 w-24 sm:w-32 lg:col-start-1 lg:w-full lg:max-w-sm" />

          <p className="col-start-1 row-start-1 text-lg font-bold leading-snug text-[#14142b] lg:row-start-2 lg:text-3xl lg:tracking-tight">
            {panel.heading}
          </p>

          <ul className="hidden lg:flex lg:row-start-3 flex-col gap-3">
            {panel.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[#3b3a55]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[#6d28d9]">
                  <IconCheck size={16} stroke={2.5} aria-hidden="true" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex justify-center px-4 pb-12 lg:items-start lg:px-12 lg:py-20">
        <div className="relative z-10 -mt-10 w-full max-w-[420px] rounded-[16px] border border-[#e4e2ef] bg-white p-6 shadow-[0_12px_32px_rgba(20,20,43,0.10)] sm:p-8 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
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
    <nav aria-label="Account type" className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-[#f6f5fb] p-1">
      {options.map((o) => {
        const active = o.key === current;
        return (
          <AuthLink
            key={o.key}
            href={o.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-lg text-sm font-semibold ${
              active
                ? "bg-white text-[#6d28d9] shadow-[0_1px_4px_rgba(20,20,43,0.12)]"
                : "text-[#3b3a55] hover:text-[#6d28d9]"
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
          className="absolute inset-y-0 right-0 min-w-[44px] px-4 text-sm font-semibold text-[#6d28d9] hover:underline"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

// Line-art study scene: laptop, stack of books, graduation cap, small plant
function StudyArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="#4c1d95"
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
      <rect x="30" y="124" width="72" height="24" rx="4" fill="#fbcfe8" />
      <line x1="40" y1="184" x2="96" y2="184" />
      <line x1="46" y1="160" x2="92" y2="160" />
      <line x1="40" y1="136" x2="92" y2="136" />

      {/* graduation cap on the books */}
      <polygon points="66,92 104,106 66,120 28,106" fill="#c4b5fd" />
      <path d="M44 112 v10 c0 6 44 6 44 0 v-10" fill="#c4b5fd" />
      <path d="M104 106 v18" />
      <circle cx="104" cy="127" r="3" fill="#fde68a" />

      {/* laptop */}
      <rect x="126" y="98" width="110" height="74" rx="6" fill="#ffffff" />
      <rect x="136" y="108" width="90" height="54" rx="3" fill="#ddd6fe" />
      <path d="M114 196 l12 -24 h110 l12 24 z" fill="#ede9fe" />
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
