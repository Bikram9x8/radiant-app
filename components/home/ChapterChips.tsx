import s from "./home.module.css";
import Reveal from "./Reveal";

const ITEMS = [
  { label: "Notes", bg: "bg-(--hp-yellow)" },
  { label: "NCERT Solutions", bg: "bg-(--hp-mint)" },
  { label: "MCQ Tests", bg: "bg-(--hp-lavender)" },
  { label: "Chapter Tests", bg: "bg-(--hp-coral)" },
  { label: "DPP", bg: "bg-(--hp-sky)" },
  { label: "PYQs", bg: "bg-(--hp-pink)" },
];

export default function ChapterChips() {
  return (
    <Reveal
      aria-labelledby="home-chapter"
      className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 pt-6 pb-9 text-center sm:px-8 md:gap-6 md:pt-8 md:pb-[72px]"
    >
      <h2 id="home-chapter" className={`${s.display} m-0 text-[32px] leading-tight font-bold md:text-[44px]`}>
        Every chapter has it all
      </h2>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0 text-[15px] font-extrabold md:gap-3 md:text-lg">
        {ITEMS.map((item) => (
          <li
            key={item.label}
            className={`${item.bg} rounded-full border-[3px] border-(--hp-ink) px-4 py-[11px] md:px-[22px] md:py-3.5`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
