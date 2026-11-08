import Link from "next/link";
import s from "./home.module.css";
import Reveal from "./Reveal";
import ScoreRing from "./ScoreRing";

export default function ScoreCard() {
  return (
    <Reveal aria-labelledby="home-test" className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-8 md:pb-[72px]">
      <div className="flex flex-col items-center gap-4 rounded-[32px] border-[3px] border-(--hp-ink) bg-white px-[22px] py-7 text-center md:flex-row md:gap-10 md:rounded-[40px] md:p-12 md:text-left">
        <ScoreRing className="h-[150px] w-[150px] shrink-0 md:h-[200px] md:w-[200px]" />
        <div className="flex w-full flex-col gap-4 md:gap-3.5">
          <h2 id="home-test" className={`${s.display} m-0 text-[28px] leading-tight font-bold md:text-[40px]`}>
            Test yourself in 10 minutes
          </h2>
          <p className="m-0 text-base leading-[1.55] text-(--hp-muted) md:text-lg">
            Quick MCQ tests with instant scores and explanations. Your progress chart shows which chapters need
            another look. In English, <span lang="hi">हिंदी</span> and <span lang="pa">ਪੰਜਾਬੀ</span>.
          </p>
          <Link
            href="/school"
            className={`${s.press} [--sx:0px] [--sy:5px] md:self-start`}
          >
            <span
              className={`${s.face} h-[54px] items-center justify-center border-[3px] border-(--hp-ink) bg-(--hp-orange) px-[26px] text-[17px] font-extrabold text-(--hp-ink)`}
            >
              Take a free test
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
