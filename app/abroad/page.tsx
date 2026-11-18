import type { Metadata } from "next";
import Link from "next/link";
import { getRate, verifiedCountries, verifiedScholarships } from "@/lib/abroad";
import { PLANNED_COUNTRIES } from "@/lib/abroad/planned";
import RouteMap from "@/components/abroad/RouteMap";
import Flag from "@/components/abroad/Flag";
import { CountryCard, PlannedCountryCard } from "@/components/abroad/CountryCard";
import PathStamps from "@/components/abroad/PathStamps";
import ExamStrip from "@/components/abroad/ExamStrip";
import ScholarshipCard from "@/components/abroad/ScholarshipCard";
import CostCalculator, { type CalcCountry } from "@/components/abroad/CostCalculator";
import s from "@/components/abroad/abroad.module.css";

export const metadata: Metadata = {
  title: "Study abroad | Radiant Educations",
  description:
    "Country guides, costs in rupees, exam prep and scholarships for Indian students, with the official source and date for every fact.",
};

// Study Abroad hub (radiant-design/study-abroad.html, "hub" view). Reachable only when
// SHOW_ABROAD is on (layout.tsx). Shows numbers only from verified facts, each with its source
// line; anything not verified yet is "Coming soon".
export default function AbroadHubPage() {
  const countries = verifiedCountries();
  const verifiedSlugs = new Set(countries.map((c) => c.slug));
  const planned = PLANNED_COUNTRIES.filter((p) => !verifiedSlugs.has(p.slug));
  const scholarships = verifiedScholarships();

  // The planner only offers countries with verified tuition, living costs and exchange rate
  const calcCountries: CalcCountry[] = countries.flatMap((c) => {
    const rate = getRate(c.currency);
    return c.tuitionPerYear && c.livingPerYear && rate
      ? [{ slug: c.slug, name: c.name, currency: c.currency, tuition: c.tuitionPerYear, living: c.livingPerYear, rate }]
      : [];
  });

  return (
    <div className={`${s.page} flex-1`}>
      {/* Hero band */}
      <div className={s.band}>
        <div className={`${s.wrap} ${s.hubGrid}`}>
          <div>
            <p className={s.crumb}>Radiant / International education</p>
            <h1 className={s.h1}>
              Study <span className={s.serLight}>abroad</span>
              <br />
              made <span className={s.serPeach}>simple.</span>
            </h1>
            <p className={s.bandLead}>
              Country guides, costs in rupees, exam prep and scholarships for Indian students. Every fact shows its
              official source and the date we checked it.
            </p>
            <div className={s.cta}>
              <a href="#countries" className={`${s.btn} ${s.pri}`}>
                Compare countries
              </a>
              <Link href="/abroad/scholarships" className={`${s.btn} ${s.ghost}`}>
                Find scholarships
              </Link>
            </div>
            <div className={s.flagRow} aria-hidden="true">
              {PLANNED_COUNTRIES.map((p) => (
                <Flag key={p.slug} code={p.flag} />
              ))}
            </div>
          </div>
          <RouteMap />
        </div>
      </div>

      <div className={s.wrap}>
        {/* Countries */}
        <section id="countries" className={s.secw} aria-labelledby="abroad-countries">
          <h2 id="abroad-countries" className={s.h2}>
            Pick a <span className={s.ser}>country</span>
          </h2>
          <p className={s.lead}>
            {countries.length > 0
              ? "Yearly tuition and living costs, work rights after study and the main intake, each from the official source."
              : "Guides for these countries are being prepared from official sources."}
          </p>
          <ul className={s.cgrid3}>
            {countries.map((c) => (
              <CountryCard key={c.slug} country={c} />
            ))}
            {planned.map((p) => (
              <PlannedCountryCard key={p.slug} name={p.name} flag={p.flag} scene={p.scene} />
            ))}
          </ul>
        </section>

        {/* Path */}
        <section className={s.secw} aria-labelledby="abroad-path">
          <h2 id="abroad-path" className={s.h2}>
            Your path <span className={`${s.ser} ${s.serCoral}`}>abroad</span>
          </h2>
          <p className={s.lead}>Six stamps in your passport, from first search to boarding the flight.</p>
          <PathStamps />
        </section>

        {/* Exams */}
        <section className={s.secw} aria-labelledby="abroad-exams">
          <h2 id="abroad-exams" className={s.h2}>
            Exam <span className={s.ser}>prep</span>
          </h2>
          <p className={s.lead}>Format, official score requirements and practice for each exam.</p>
          <ExamStrip />
        </section>

        {/* Cost planner */}
        <section className={s.secw} aria-labelledby="abroad-cost">
          <h2 id="abroad-cost" className={s.h2}>
            What will it <span className={`${s.ser} ${s.serCoral}`}>cost?</span>
          </h2>
          {calcCountries.length > 0 ? (
            <>
              <p className={s.lead}>Move the sliders to plan your budget from official figures.</p>
              <CostCalculator countries={calcCountries} />
            </>
          ) : (
            <div className={s.soonCard}>
              <p>
                The cost planner will turn official tuition and living-cost figures into rupees, with the source and
                date of every number.
              </p>
              <span className={s.soonTag}>Coming soon</span>
            </div>
          )}
        </section>

        {/* Scholarships */}
        <section className={`${s.secw} ${s.secLast}`} aria-labelledby="abroad-sch">
          <h2 id="abroad-sch" className={s.h2}>
            Scholarships <span className={s.ser}>abroad</span>
          </h2>
          <p className={s.lead}>Fully funded and partial scholarships for Indian students, each linked to its official page.</p>
          {scholarships.length > 0 ? (
            <div className={s.slist}>
              {scholarships.slice(0, 3).map((sch) => (
                <ScholarshipCard key={sch.slug} item={sch} />
              ))}
            </div>
          ) : (
            <div className={s.soonCard}>
              <p>Scholarship summaries are being prepared from the official pages.</p>
              <span className={s.soonTag}>Coming soon</span>
            </div>
          )}
          <Link href="/abroad/scholarships" className={`${s.btn} ${s.dark} ${s.mt}`}>
            See all scholarships
          </Link>
        </section>
      </div>
    </div>
  );
}
