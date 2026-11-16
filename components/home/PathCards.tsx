import Link from "next/link";
import s from "./home.module.css";
import Reveal from "./Reveal";
import { SHOW_SCHOOL } from "@/lib/features";

const ALL_PATHS = [
  {
    href: "/school",
    title: "School Education",
    sub: "CBSE · ICSE · JEE · NEET · SSC",
    cta: "Pick your class →",
    bg: "bg-(--hp-lavender)",
    tilt: "[--tilt:-1.2deg]",
  },
  {
    href: "/higher",
    title: "Higher Education",
    sub: "Colleges · Scholarships · Internships",
    cta: "Plan your next step →",
    bg: "bg-(--hp-mint)",
    tilt: "[--tilt:1.2deg]",
  },
];

// School Education switched off (lib/features.ts): the School card becomes Entrance exam prep
const PATHS = SHOW_SCHOOL
  ? ALL_PATHS
  : ALL_PATHS.map((p) =>
      p.href === "/school"
        ? { ...p, href: "/opportunities", title: "Entrance exam prep", sub: "JEE · NEET · Class 11–12 tests", cta: "Start practising →" }
        : p,
    );

export default function PathCards() {
  return (
    <Reveal
      aria-labelledby="home-paths"
      className="mx-auto grid max-w-[1200px] gap-[18px] px-4 pt-2 pb-8 sm:px-8 md:grid-cols-2 md:gap-6 md:pt-6 md:pb-16"
    >
      <h2 id="home-paths" className="sr-only">
        Choose your path
      </h2>
      {PATHS.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className={`${s.press} ${s.tilt} ${p.tilt} [--radius:28px] md:[--radius:36px] md:[--sx:8px] md:[--sy:8px]`}
        >
          <div
            className={`${s.face} ${p.bg} flex-col gap-2.5 border-[3px] border-(--hp-ink) p-6 text-(--hp-ink) md:gap-3.5 md:p-9`}
          >
            <h3 className={`${s.display} m-0 text-[28px] leading-tight font-bold md:text-4xl`}>{p.title}</h3>
            <span className="text-base font-bold md:text-lg">{p.sub}</span>
            <span className="flex h-11 items-center self-start rounded-full bg-(--hp-ink) px-[18px] font-extrabold text-white md:mt-2 md:h-12 md:px-[22px]">
              {p.cta}
            </span>
          </div>
        </Link>
      ))}
    </Reveal>
  );
}
