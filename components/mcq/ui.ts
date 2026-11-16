// Class names for MCQ pages (admin and student), taken from the site's design system
// (globals.css "NEW DESIGN SYSTEM", AuthLayout and the student dashboard). No new colours or fonts.
// Plain module (no "use client") so both server and client components can import it.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d28d9]";

// Same as authInput / authLabel in components/AuthLayout.tsx
export const inputClass =
  "w-full min-h-[44px] rounded-xl border border-[#d4d4d8] bg-white px-4 py-2.5 text-[#14142b] placeholder:text-zinc-500 outline-none focus:border-[#6d28d9] focus:ring-2 focus:ring-[#6d28d9]/25";
export const labelClass = "block text-sm font-semibold text-[#14142b] mb-1.5";

export const primaryButton = `inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#6d28d9] px-4 text-sm font-semibold text-white hover:bg-[#5b21b6] disabled:opacity-60 ${focusRing}`;
export const secondaryButton = `inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#d4d4d8] bg-white px-4 text-sm font-semibold text-[#14142b] hover:border-[#6d28d9] hover:text-[#6d28d9] disabled:opacity-60 ${focusRing}`;
export const dangerButton = `inline-flex min-h-[44px] items-center justify-center rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60 ${focusRing}`;

// Compact actions inside list rows
export const rowButton = `inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[#d4d4d8] bg-white px-3 text-sm font-semibold text-[#14142b] hover:border-[#6d28d9] hover:text-[#6d28d9] disabled:opacity-40 ${focusRing}`;
export const rowDangerButton = `inline-flex min-h-[36px] items-center justify-center rounded-lg border border-[#d4d4d8] bg-white px-3 text-sm font-semibold text-red-700 hover:border-red-700 disabled:opacity-40 ${focusRing}`;

export const backLink = `inline-block rounded text-sm font-semibold text-[#6d28d9] hover:underline ${focusRing}`;
export const pageTitle = "mt-4 text-3xl font-extrabold tracking-tight text-[#14142b]";
export const pageIntro = "mt-2 max-w-prose text-[#3b3a55]";
export const sectionTitle = "text-lg font-bold text-[#14142b]";
export const mutedText = "text-sm text-[#3b3a55]";
export const errorText = "text-sm text-red-700";
export const successText = "text-sm font-semibold text-[#0f766e]";

// Question, option and explanation text: Noto for Hindi/Punjabi, taller lines for vowel signs
export const questionText = "font-question leading-[1.65]";

// Status badges use the existing pastel classes
export const badgeBase = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
export const badgePublished = `${badgeBase} pastel-mint`;
export const badgeDraft = `${badgeBase} bg-[#f6f5fb] text-[#3b3a55]`;
export const badgeInfo = `${badgeBase} pastel-purple`;
