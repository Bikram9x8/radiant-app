import s from "./home.module.css";

// Decorative only: an example chapter card, not the visitor's data.
// Hidden from screen readers; the base tilt of each shape lives in `transform`,
// so the float animations (which use translate/rotate) add on top of it.
function Check() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
      <path
        d="M4 9.5 l3.2 3.2 L14 5.5"
        fill="none"
        stroke="var(--hp-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[330px] w-full max-w-[400px] select-none sm:h-[400px] lg:h-[460px] lg:max-w-[460px]"
    >
      {/* Lavender blob behind the card */}
      <div
        className="absolute top-[10px] left-[2%] h-[290px] w-[80%] max-w-[320px] lg:top-5 lg:left-[6%] lg:h-[380px]"
        style={{ transform: "rotate(-5deg)" }}
      >
        <div className={`${s.floatBlob} h-full w-full rounded-[32px] bg-(--hp-lavender) lg:rounded-[40px]`} />
      </div>

      {/* Example chapter card */}
      <div className="absolute top-5 left-[8%] w-[80%] max-w-[320px] lg:top-10 lg:left-[15%]">
        <div
          className={`${s.floatCard} flex flex-col gap-3 rounded-[28px] border-[3px] border-(--hp-ink) bg-white p-5 shadow-[6px_6px_0_var(--hp-ink)] lg:gap-3.5 lg:rounded-[32px] lg:p-6 lg:shadow-[8px_8px_0_var(--hp-ink)]`}
        >
          <span className="self-start rounded-full bg-(--hp-yellow) px-2.5 py-[5px] text-xs font-extrabold lg:px-3 lg:py-1.5 lg:text-[13px]">
            Class 10 · Maths
          </span>
          <span className={`${s.display} text-[22px] font-bold lg:text-[26px]`}>Ch 1 · Real Numbers</span>
          <div className="flex flex-col gap-2.5 text-[15px] font-bold lg:text-base">
            <div className="flex items-center justify-between rounded-[14px] bg-(--hp-butter) px-3 py-[11px] lg:rounded-2xl lg:px-3.5 lg:py-3">
              <span>Notes</span>
              <Check />
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-(--hp-mint-soft) px-3 py-[11px] lg:rounded-2xl lg:px-3.5 lg:py-3">
              <span>NCERT Solutions</span>
              <Check />
            </div>
            <div className="flex items-center justify-between rounded-[14px] bg-(--hp-lavender-soft) px-3 py-[11px] lg:rounded-2xl lg:px-3.5 lg:py-3">
              <span>MCQ Test</span>
              <span>8 / 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Star (the phone mockup leaves it out) */}
      <div className="absolute top-0 right-[2%] hidden w-[84px] sm:block lg:w-[110px]">
        <svg viewBox="0 0 110 110" className={`${s.floatStar} h-auto w-full`}>
          <path
            d="M55 5 l13 33 l35 2 l-27 22 l9 34 l-30 -19 l-30 19 l9 -34 l-27 -22 l35 -2 z"
            fill="var(--hp-yellow)"
            stroke="var(--hp-ink)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* "82% this week!" badge */}
      <div className="absolute right-0 bottom-0 lg:bottom-[30px]" style={{ transform: "rotate(5deg)" }}>
        <div
          className={`${s.floatBadge} ${s.display} rounded-[18px] border-[3px] border-(--hp-ink) bg-(--hp-mint) px-3.5 py-2.5 text-[17px] font-bold lg:rounded-[22px] lg:px-[18px] lg:py-3.5 lg:text-xl`}
        >
          82% this week!
        </div>
      </div>
    </div>
  );
}
