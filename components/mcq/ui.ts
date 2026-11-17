// Class names for MCQ pages (admin and student), Phase 2 calm style (same as the homepage,
// AuthLayout and the student pages): teal accents, 1.5px field lines, pill buttons, Big Shoulders titles.
// Plain module (no "use client") so both server and client components can import it.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

// Same as authInput / authLabel in components/AuthLayout.tsx
export const inputClass =
  "w-full min-h-[46px] rounded-xl border-[1.5px] border-btn-line bg-white px-4 py-2.5 text-ink placeholder:text-muted outline-none hover:border-[#b8c4d1] focus:border-teal focus:ring-3 focus:ring-teal/25";
export const labelClass = "block text-sm font-bold text-ink mb-1.5";

export const primaryButton = `inline-flex min-h-[44px] items-center justify-center rounded-full bg-teal px-5 text-sm font-bold text-white hover:bg-teal-dark disabled:opacity-60 ${focusRing}`;
export const secondaryButton = `inline-flex min-h-[44px] items-center justify-center rounded-full border-[1.5px] border-btn-line bg-white px-5 text-sm font-bold text-ink hover:border-ink disabled:opacity-60 ${focusRing}`;
export const dangerButton = `inline-flex min-h-[44px] items-center justify-center rounded-full bg-red-700 px-5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60 ${focusRing}`;

// Compact actions inside list rows
export const rowButton = `inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border-[1.5px] border-btn-line bg-white px-3 text-sm font-semibold text-ink hover:border-ink disabled:opacity-40 ${focusRing}`;
export const rowDangerButton = `inline-flex min-h-[36px] items-center justify-center rounded-lg border-[1.5px] border-btn-line bg-white px-3 text-sm font-semibold text-red-700 hover:border-red-700 disabled:opacity-40 ${focusRing}`;

export const backLink = `inline-block rounded text-sm font-bold text-teal-dark underline-offset-4 hover:underline ${focusRing}`;
export const pageTitle = "mt-4 font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl";
export const pageIntro = "mt-2 max-w-prose text-muted";
export const sectionTitle = "font-display text-2xl leading-none font-extrabold uppercase text-ink";
export const mutedText = "text-sm text-muted";
export const errorText = "text-sm text-red-700";
export const successText = "text-sm font-semibold text-teal-dark";

// Question, option and explanation text: Noto for Hindi/Punjabi, taller lines for vowel signs
export const questionText = "font-question leading-[1.65]";

// Status badges use the existing pastel classes
export const badgeBase = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
export const badgePublished = `${badgeBase} pastel-mint`;
export const badgeDraft = `${badgeBase} bg-[#f1f5f9] text-ink-2`;
export const badgeInfo = `${badgeBase} pastel-blue`;
