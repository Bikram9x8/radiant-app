import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountry, getExam, getRate, verifiedCountries, verifiedScholarships } from "@/lib/abroad";
import CostCalculator from "@/components/abroad/CostCalculator";
import Sources from "@/components/abroad/Sources";
import {
  CountryHeader,
  FactRows,
  FaqList,
  Section,
  StatStrip,
  Steps,
  money,
} from "@/components/abroad/CountryParts";
import s from "@/components/abroad/abroad.module.css";

// Only verified countries have a page; every other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return verifiedCountries().map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const c = getCountry(country);
  return {
    title: c ? `Study in ${c.name} | Radiant Educations` : "Study abroad | Radiant Educations",
    description: c ? `Costs, intakes, work rights and visa steps for studying in ${c.name}, with official sources.` : undefined,
  };
}

// Country guide (radiant-design/study-abroad.html, "country" view). Every value comes from a
// verified fact with its source line; anything not verified yet says "Coming soon".
export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) notFound();

  const others = verifiedCountries().filter((o) => o.slug !== c.slug);
  const rate = getRate(c.currency);
  const calc =
    c.tuitionPerYear && c.livingPerYear && rate
      ? [{ slug: c.slug, name: c.name, currency: c.currency, tuition: c.tuitionPerYear, living: c.livingPerYear, rate }]
      : [];
  const scholarships = verifiedScholarships().filter((sch) => sch.countries.includes(c.slug));
  const ielts = getExam("ielts");

  return (
    <div className={`${s.page} flex-1`}>
      <CountryHeader country={c} others={others} />
      <StatStrip country={c} />

      <div className={`${s.wrap} ${s.cgrid}`}>
        <div>
          <Section id="c-costs" title="Costs" accent="in rupees" coral>
            {calc.length > 0 ? (
              <CostCalculator countries={calc} />
            ) : (
              <p className={s.mutedP}>
                The cost planner for {c.name} will appear when the official tuition, living-cost and exchange-rate
                figures are checked. <span className={s.soonTag}>Coming soon</span>
              </p>
            )}
          </Section>

          <Section id="c-money" title="Money for the" accent="visa">
            <FactRows
              rows={[
                { label: "Funds you must show", value: money(c.visaFundsProof) },
                { label: "Student visa fee", value: money(c.visaFee) },
              ]}
            />
            <Sources facts={[c.visaFundsProof, c.visaFee]} />
          </Section>

          <Section id="c-work" title="Work" accent="rights" coral>
            <FactRows
              rows={[
                { label: "While studying", value: c.workDuringStudy?.value ?? null },
                { label: "After your degree", value: c.postStudyWork?.value ?? null },
              ]}
            />
            <Sources facts={[c.workDuringStudy, c.postStudyWork]} />
          </Section>

          <Section id="c-intakes" title="Intakes">
            {c.intakes ? (
              <>
                <ul className={s.intakes}>
                  {c.intakes.value.map((i) => (
                    <li key={i} className={i === c.mainIntake ? s.intakeMain : undefined}>
                      {i}
                      {i === c.mainIntake ? " · main" : ""}
                    </li>
                  ))}
                </ul>
                <Sources facts={[c.intakes]} />
              </>
            ) : (
              <p className={s.mutedP}>
                <span className={s.soonTag}>Coming soon</span>
              </p>
            )}
          </Section>

          <Section id="c-english" title="English test" accent="minimums" coral>
            {c.englishMinimums ? (
              <>
                <FactRows rows={c.englishMinimums.value.map((m) => ({ label: m.label, value: m.minimum }))} />
                <p className={s.note}>Official minimums only. Each university may ask for a higher score.</p>
                <Sources facts={[c.englishMinimums]} />
              </>
            ) : (
              <p className={s.mutedP}>
                Official minimums will be listed here with their source. <span className={s.soonTag}>Coming soon</span>
              </p>
            )}
          </Section>

          <Section id="c-unis" title="Universities" accent={`in ${c.name}`}>
            <p className={s.mutedP}>
              University pages for {c.name} are coming with the college database.{" "}
              <span className={s.soonTag}>Coming soon</span>
            </p>
          </Section>

          {c.visaSteps.length > 0 && (
            <Section id="c-visa" title="Student visa" accent="steps" coral>
              <Steps steps={c.visaSteps} />
            </Section>
          )}

          {c.faqs.length > 0 && (
            <Section id="c-faq" title="Questions" accent="students ask">
              <FaqList faqs={c.faqs} />
            </Section>
          )}
        </div>

        <aside className={s.side} aria-label={`More about studying in ${c.name}`}>
          <div className={s.sideCard}>
            <h2 className={s.sideTitle}>Exams accepted</h2>
            <p className={s.mutedP}>{c.examsAccepted ? c.examsAccepted.value.join(", ") : "Coming soon"}</p>
            <Sources facts={[c.examsAccepted]} />
            {ielts && (
              <Link href="/abroad/exams/ielts" className={`${s.btn} ${s.pri} ${s.full}`}>
                IELTS guide
              </Link>
            )}
          </div>
          <div className={s.sideCard}>
            <h2 className={s.sideTitle}>Scholarships</h2>
            {scholarships.length > 0 ? (
              <>
                <ul className={s.miniList}>
                  {scholarships.map((sch) => (
                    <li key={sch.slug}>
                      <a href={sch.officialUrl} target="_blank" rel="noopener noreferrer">
                        <b>{sch.name}</b>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      {sch.covers && <small>{sch.covers.value}</small>}
                    </li>
                  ))}
                </ul>
                <Sources facts={scholarships.map((sch) => sch.covers)} />
              </>
            ) : (
              <p className={s.mutedP}>Scholarships for {c.name} are coming soon.</p>
            )}
            <Link href="/abroad/scholarships" className={s.textLink}>
              All scholarships →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
