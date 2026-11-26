import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import s from "./landing.module.css";
import AdmissionPass from "./AdmissionPass";
import { SHOW_ABROAD, SHOW_COLLEGES } from "@/lib/features";

// Hand-drawn underline under an accent word
function Underline() {
  return (
    <svg className={s.ul} viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M3 8 Q 60 1 110 6 T 197 5" />
    </svg>
  );
}

function Accent({ children, coral = false }: { children: React.ReactNode; coral?: boolean }) {
  return (
    <span className={`${s.ser} ${coral ? s.serCoral : ""}`}>
      {children}
      <Underline />
    </span>
  );
}

// Line 1 accent: "college." -> "course." -> "scholarship." -> "internship." -> "college.", once.
// All words share one grid cell, so the width of the longest word is reserved (no layout jump).
// Screen readers only hear the static "college."; the rotating words are hidden from them.
// Without motion (or before/after the run) only "college." shows. Timing: landing.module.css.
const ROTATING = ["college.", "course.", "scholarship.", "internship.", "college."];

function RotatingAccent() {
  return (
    <span className={s.ser}>
      <span className="sr-only">college.</span>
      <span className={s.rotWords} aria-hidden="true">
        {ROTATING.map((w, i) => (
          <span key={i} className={s.rotWord} data-step={i}>
            {w}
            <Underline />
          </span>
        ))}
      </span>
    </span>
  );
}

// finder: the real college finder while SHOW_COLLEGES is on (passed in by app/page.tsx); without it the
// hero shows the sample AdmissionPass exactly as before.
export default function Hero({ finder }: { finder?: React.ReactNode } = {}) {
  return (
    <div className={`${s.wrap} ${s.hero}`}>
      <span className={`${s.blob} ${s.blobA}`} aria-hidden="true" />
      <span className={`${s.blob} ${s.blobB}`} aria-hidden="true" />

      <div className={s.heroText}>
        <h1 className={s.h1}>
          <span className={s.line}>
            Find your <RotatingAccent />
          </span>
          <span className={s.line}>
            Crack the <Accent coral>entrance.</Accent>
          </span>
          <span className={s.line}>
            Build your <Accent>career.</Accent>
          </span>
        </h1>
        {SHOW_COLLEGES ? (
          <p className={`${s.lead} ${s.enter}`}>
            Colleges with fees, eligibility and entrance exams checked on official pages, entrance exam prep for
            JEE and NEET, scholarships and internships after Class 12.
          </p>
        ) : (
          <p className={`${s.lead} ${s.enter}`}>
            Entrance exam prep for JEE and NEET, scholarships and internships after Class 12. A college finder
            for all of India is coming soon.
          </p>
        )}

        <div className={`${s.cta} ${s.enter}`}>
          <Link href="/higher" className={`${s.btn} ${s.pri}`}>
            Explore after Class 12
          </Link>
          <Link href="/opportunities" className={`${s.btn} ${s.out}`}>
            Explore entrance prep
          </Link>
        </div>

        {/* Slim site search (searches posts: tests, notes, solutions) */}
        <form action="/search" method="get" role="search" className={`${s.search} ${s.enter}`}>
          <label htmlFor="home-search" className="sr-only">
            Search tests and topics
          </label>
          <IconSearch aria-hidden="true" size={20} className="shrink-0 text-(--muted)" />
          <input id="home-search" name="q" type="text" placeholder="Search a test or topic" />
          <button type="submit">Search</button>
        </form>

        <ul className={`${s.stats}${SHOW_ABROAD ? ` ${s.statsFour}` : ""} ${s.enter}`}>
          <li>JEE · NEET prep</li>
          <li>Scholarships &amp; internships</li>
          <li>Free to use</li>
          {SHOW_ABROAD && <li>Study abroad</li>}
        </ul>
      </div>

      {finder ?? <AdmissionPass />}
    </div>
  );
}
