import Link from "next/link";
import s from "./home.module.css";
import Reveal from "./Reveal";

export default function JoinBanner() {
  return (
    <Reveal aria-labelledby="home-join" className="border-t-[3px] border-(--hp-ink) bg-(--hp-yellow)">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[18px] px-4 py-9 sm:px-8 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:py-14">
        <h2
          id="home-join"
          className={`${s.display} m-0 max-w-[640px] text-[30px] leading-[1.15] font-bold md:text-[40px]`}
        >
          Join free and keep track of everything you learn.
        </h2>
        {/* Soft navigation to /signup opens the existing signup modal */}
        <Link
          href="/signup"
          className={`${s.flat} flex h-14 items-center justify-center rounded-full bg-(--hp-ink) px-[30px] text-[17px] font-extrabold text-white no-underline md:h-[58px] md:text-lg`}
        >
          Create my free account
        </Link>
      </div>
    </Reveal>
  );
}
