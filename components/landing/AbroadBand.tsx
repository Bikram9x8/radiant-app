import Link from "next/link";
import { getExam, getRate, verifiedCountries, verifiedScholarships } from "@/lib/abroad";
import { PLANNED_COUNTRIES } from "@/lib/abroad/planned";
import { MiniCountryCard, PlannedCountryCard } from "@/components/abroad/CountryCard";
import RouteMap from "@/components/abroad/RouteMap";
import PathStamps from "@/components/abroad/PathStamps";
import Sources from "@/components/abroad/Sources";
import s from "./landing.module.css";

const WHY_SOURCES = { title: "Official sources", text: "Every fact links its official source and the date we checked it." };
const WHY_VISA = {
  title: "Visa money and work rights, explained simply",
  text: "Visa fees, the money to show and work rules, taken from government pages.",
};
// Only shown once rupee costs really appear (a verified tuition or living figure plus an official rate)
const WHY_RUPEES = { title: "Costs in rupees", text: "Fees are converted to rupees with official exchange rates." };
const WHY_FREE = { title: "Free for students", text: "Every guide is free to read and use." };

// "Study abroad" band on the homepage (rendered only when SHOW_ABROAD is on, see app/page.tsx).
// Numbers come only from verified facts, each with its source line. Planned countries show a
// drawing and "Guide coming soon", never numbers. Scenes play once on load, more on hover,
// and stand still with reduced motion (abroad.module.css).
export default function AbroadBand() {
  const countries = verifiedCountries();
  const verifiedSlugs = new Set(countries.map((c) => c.slug));
  const planned = PLANNED_COUNTRIES.filter((p) => !verifiedSlugs.has(p.slug));
  const scholarships = verifiedScholarships().slice(0, 3);
  const ielts = getExam("ielts");
  const showsRupees = countries.some((c) => (c.tuitionPerYear || c.livingPerYear) && getRate(c.currency));
  const why = showsRupees ? [WHY_SOURCES, WHY_VISA, WHY_RUPEES, WHY_FREE] : [WHY_SOURCES, WHY_VISA, WHY_FREE];
  // Full cards fill the row: two equal columns for 2 countries, three for 3 or more
  const cardsCols = countries.length === 2 ? s.abroadCards2 : countries.length >= 3 ? s.abroadCards3 : "";

  return (
    <section className={`${s.wrap} ${s.section} ${s.abroadHome}`} aria-labelledby="home-abroad">
      <div className={s.abroadHead}>
        <div>
          <h2 id="home-abroad" className={s.h2}>
            Study <span className={s.ser}>abroad</span>
          </h2>
          <p className={s.lead}>Country guides, visa money, work rights and scholarships, each with its official source.</p>
        </div>
        <div className={s.abroadGlobe}>
          <RouteMap tone="light" />
        </div>
      </div>

      {countries.length > 0 && (
        <ul className={`${s.abroadCards}${cardsCols ? ` ${cardsCols}` : ""}`}>
          {countries.map((c) => (
            <MiniCountryCard key={c.slug} country={c} />
          ))}
        </ul>
      )}

      {planned.length > 0 && (
        <ul className={s.abroadPlanned} aria-label="More country guides on the way">
          {planned.map((p) => (
            <PlannedCountryCard key={p.slug} name={p.name} flag={p.flag} scene={p.scene} small />
          ))}
        </ul>
      )}

      <div className={s.abroadSub}>
        <h3 className={s.abroadH3}>
          Your path <span className={`${s.ser} ${s.serCoral}`}>abroad</span>
        </h3>
        <div className={s.abroadPath}>
          <PathStamps />
        </div>
      </div>

      {scholarships.length > 0 && (
        <div className={s.abroadSub}>
          <div className={s.abroadSubHead}>
            <h3 className={s.abroadH3}>
              Scholarships <span className={s.ser}>abroad</span>
            </h3>
            <Link href="/abroad/scholarships" className={s.abroadMore}>
              All scholarships →
            </Link>
          </div>
          <ul className={s.abroadSch}>
            {scholarships.map((sch) => (
              <li key={sch.slug} className={s.sticker}>
                <h4>{sch.name}</h4>
                {sch.covers && <p>{sch.covers.value}</p>}
                {sch.deadline && (
                  <p className={s.abroadDeadline}>
                    <b>Deadline:</b> {sch.deadline.value}
                  </p>
                )}
                <a href={sch.officialUrl} target="_blank" rel="noopener noreferrer" className={s.abroadOfficial}>
                  Official page<span className="sr-only"> for {sch.name} (opens in a new tab)</span> →
                </a>
                <Sources facts={[sch.covers, sch.deadline]} className={s.abroadSources} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={s.abroadSub}>
        <h3 className={s.abroadH3}>
          Why <span className={s.ser}>Radiant</span>
        </h3>
        <ul className={s.abroadWhy}>
          {why.map((w) => (
            <li key={w.title}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="11" fill="var(--tint-teal)" />
                <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="var(--teal-dark)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                <b>{w.title}</b>
                {w.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={s.abroadCta}>
        <Link href="/abroad" className={`${s.btn} ${s.pri}`}>
          Compare countries
        </Link>
        {ielts && (
          <Link href="/abroad/exams/ielts" className={`${s.btn} ${s.out}`}>
            IELTS guide
          </Link>
        )}
      </div>
    </section>
  );
}
