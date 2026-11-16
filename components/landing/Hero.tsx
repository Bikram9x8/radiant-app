import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import s from "./landing.module.css";
import AdmissionPass from "./AdmissionPass";

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

export default function Hero() {
  return (
    <div className={`${s.wrap} ${s.hero}`}>
      <span className={`${s.blob} ${s.blobA}`} aria-hidden="true" />
      <span className={`${s.blob} ${s.blobB}`} aria-hidden="true" />

      <div>
        <h1 className={s.h1}>
          <span className={s.line}>
            Find your <Accent>college.</Accent>
          </span>
          <span className={s.line}>
            Crack the <Accent coral>entrance.</Accent>
          </span>
          <span className={s.line}>
            Build your <Accent>career.</Accent>
          </span>
        </h1>
        <p className={`${s.lead} ${s.enter}`}>
          Entrance exam prep for JEE and NEET, scholarships and internships after Class 12. A college finder
          for all of India is coming soon.
        </p>

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

        <ul className={`${s.stats} ${s.enter}`}>
          <li>JEE · NEET prep</li>
          <li>Scholarships &amp; internships</li>
          <li>Free to use</li>
        </ul>
      </div>

      <AdmissionPass />
    </div>
  );
}
