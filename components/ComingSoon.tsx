import Link from "next/link";
import cs from "./ComingSoon.module.css";

// "Coming soon" for empty pages and empty sections (School and Higher Education).
// Render inside a page with the Option B tokens (components/school/school.module.css .page).
//   size="page":   "Writing notes" animation, title, text, and a back pill to the parent page
//   size="inline": a small (56px) version of the same notebook and pencil next to "Coming soon"
// The drawing is option 1 "Writing notes" from the user's design, copied exactly.

function WritingNotes({ className, decorative }: { className: string; decorative?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 160"
      className={className}
      focusable="false"
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": "A pencil writing notes in a notebook" })}
    >
      <rect x="34" y="20" width="152" height="120" rx="14" fill="#241a3d" transform="translate(5 5)" />
      <rect x="34" y="20" width="152" height="120" rx="14" fill="#fff" stroke="#241a3d" strokeWidth="4" />
      <rect x="34" y="20" width="26" height="120" rx="12" fill="#c9b6ff" stroke="#241a3d" strokeWidth="4" />
      <g stroke="#e9e2f7" strokeWidth="3">
        <line x1="72" y1="56" x2="172" y2="56" />
        <line x1="72" y1="74" x2="172" y2="74" />
        <line x1="72" y1="92" x2="172" y2="92" />
        <line x1="72" y1="110" x2="172" y2="110" />
      </g>
      <path
        className={cs.csW1}
        pathLength={100}
        d="M74 54 q6 -6 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0"
        fill="none"
        stroke="#6d28d9"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        className={cs.csW2}
        pathLength={100}
        d="M74 72 q6 -6 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0"
        fill="none"
        stroke="#6d28d9"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        className={cs.csW3}
        pathLength={100}
        d="M74 90 q6 -6 10 0 t10 0 t10 0 t10 0 t10 0 t10 0"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <g className={cs.csPencil}>
        <g transform="translate(76 52) rotate(-40)">
          <rect x="0" y="-52" width="12" height="40" rx="2" fill="#ff6b3d" stroke="#241a3d" strokeWidth="3" />
          <rect x="0" y="-60" width="12" height="9" rx="3" fill="#ffb3d6" stroke="#241a3d" strokeWidth="3" />
          <path d="M0 -12 L12 -12 L6 0 Z" fill="#ffe2b8" stroke="#241a3d" strokeWidth="3" strokeLinejoin="round" />
          <path d="M4 -4 L8 -4 L6 0 Z" fill="#241a3d" />
        </g>
      </g>
    </svg>
  );
}

export default function ComingSoon({
  size = "page",
  back,
}: {
  size?: "page" | "inline";
  /** Page size: link back to the parent page (from the breadcrumb) */
  back?: { href: string; label: string };
}) {
  if (size === "inline") {
    // Fixed 56px-wide drawing (height follows the 220:160 viewBox), so the row never shifts
    return (
      <span className="inline-flex items-center gap-2.5 text-[15px] font-bold text-(--hp-muted)">
        <WritingNotes className="block h-auto w-14 shrink-0" decorative />
        Coming soon
      </span>
    );
  }

  return (
    <div className="rounded-[28px] border-[3px] border-(--hp-ink) bg-white px-6 py-8 text-center sm:px-10 sm:py-10">
      <WritingNotes className="mx-auto block h-auto w-52 sm:w-60" />
      <h2
        className="m-0 mt-4 text-[30px] leading-tight font-bold"
        style={{ fontFamily: "var(--font-fredoka), var(--font-nunito), sans-serif" }}
      >
        Coming soon
      </h2>
      <p className="mx-auto mt-2 max-w-[40ch] text-[17px] leading-[1.55] font-semibold text-(--hp-muted)">
        Our teachers are writing this right now. Check back soon!
      </p>
      {back && (
        <Link
          href={back.href}
          className="mt-5 inline-flex min-h-12 items-center rounded-full border-[3px] border-(--hp-ink) bg-white px-6 text-base font-extrabold text-(--hp-ink) no-underline hover:bg-(--hp-butter)"
        >
          ← Back to {back.label}
        </Link>
      )}
    </div>
  );
}
