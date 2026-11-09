import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import s from "./home.module.css";
import HeroIllustration from "./HeroIllustration";

// CSS custom properties need a cast to pass through React's style prop.
const vars = (v: Record<string, string>) => v as React.CSSProperties;

const HIGHLIGHTS = [
  { word: "Learn", bg: "var(--hp-yellow)", rot: "-2deg", delay: "60ms" },
  { word: "Practise", bg: "var(--hp-mint)", rot: "1.5deg", delay: "200ms" },
  { word: "Ace", bg: "var(--hp-pink)", rot: "-1deg", delay: "340ms" },
];

export default function Hero() {
  return (
    <section
      aria-labelledby="home-title"
      className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pt-6 pb-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pt-12 lg:pb-[72px]"
    >
      <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
        <h1
          id="home-title"
          className={`${s.display} m-0 text-[46px] leading-[1.18] font-bold sm:text-[56px] lg:text-[68px] lg:leading-[1.12]`}
        >
          {HIGHLIGHTS.map((h, i) => (
            <span key={h.word}>
              <span className={s.hl} style={vars({ background: h.bg, "--rot": h.rot, "--delay": h.delay })}>
                {h.word}
              </span>{" "}
              it.
              {i < HIGHLIGHTS.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="m-0 max-w-[500px] text-[17px] leading-[1.55] text-(--hp-muted) lg:text-xl">
          Friendly notes, NCERT solutions and MCQ tests for every chapter, plus internships when you&apos;re
          ready for the next step.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Soft navigation to /signup opens the existing signup modal */}
          <Link
            href="/signup"
            className={`${s.press} [--shadow:var(--hp-purple-deep)] [--sx:0px] [--sy:5px] lg:[--sy:6px]`}
          >
            <span
              className={`${s.face} h-14 items-center justify-center bg-(--hp-purple) px-[30px] text-lg font-extrabold text-white lg:h-[58px]`}
            >
              Start learning free
            </span>
          </Link>
          <Link
            href="/school"
            className={`${s.flat} flex h-[54px] items-center justify-center rounded-full border-[3px] border-(--hp-ink) bg-white px-[26px] text-[17px] font-extrabold text-(--hp-ink) no-underline lg:h-[58px] lg:text-lg`}
          >
            Browse classes
          </Link>
        </div>

        <form
          action="/search"
          method="get"
          role="search"
          className={`${s.search} flex h-14 w-full max-w-[520px] items-center gap-2 rounded-full border-[3px] border-(--hp-ink) bg-white pr-1.5 pl-4`}
        >
          <label htmlFor="home-search" className="sr-only">
            Search chapters, tests and notes
          </label>
          <IconSearch aria-hidden="true" size={20} className="shrink-0 text-(--hp-muted)" />
          <input
            id="home-search"
            name="q"
            type="text"
            placeholder="Search a chapter, test or topic"
            className="min-w-0 flex-1 bg-transparent py-2 text-base font-semibold text-(--hp-ink) placeholder:text-(--hp-muted)"
          />
          <button
            type="submit"
            className={`${s.flat} h-11 shrink-0 rounded-full bg-(--hp-ink) px-5 font-extrabold text-white`}
          >
            Search
          </button>
        </form>

        <p className="m-0 text-[15px] font-bold text-(--hp-muted)">
          Hiring interns?{" "}
          <Link
            href="/signup/company"
            className="inline-flex min-h-11 items-center text-(--hp-link) underline underline-offset-4 hover:text-(--hp-purple-deep)"
          >
            Sign up as a company
          </Link>
        </p>
      </div>

      <HeroIllustration />
    </section>
  );
}
