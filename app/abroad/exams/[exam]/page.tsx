import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam, verifiedCountries, verifiedExams } from "@/lib/abroad";
import { PLANNED_EXAMS } from "@/lib/abroad/planned";
import { formatMoney } from "@/lib/abroad/format";
import Sources from "@/components/abroad/Sources";
import BandPicker from "@/components/abroad/BandPicker";
import { FaqList, Section, Steps } from "@/components/abroad/CountryParts";
import s from "@/components/abroad/abroad.module.css";

// Only verified exams have a page; every other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return verifiedExams().map((e) => ({ exam: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ exam: string }> }): Promise<Metadata> {
  const { exam } = await params;
  const e = getExam(exam);
  return {
    title: e ? `${e.name}${e.subtitle ? ` ${e.subtitle}` : ""} | Study abroad | Radiant Educations` : "Study abroad | Radiant Educations",
    description: e ? `${e.name}: format, official score requirements and fees, with sources.` : undefined,
  };
}

const SOON = <span className={s.soonInline}>Coming soon</span>;

// Exam guide (radiant-design/study-abroad.html, "exam" view, IELTS first). Facts only from the
// exam's verified data with source lines; the "scores countries ask for" table lists OFFICIAL
// minimums from verified country pages, never typical ranges.
export default async function ExamPage({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const e = getExam(exam);
  if (!e) notFound();

  const quick = [
    { label: "Score scale", value: e.scoreScale?.value ?? null },
    { label: "Total test time", value: e.duration?.value ?? null },
    { label: "Fee in India", value: e.feeIndia ? formatMoney(e.feeIndia.value) : null },
    { label: "Score valid for", value: e.validity?.value ?? null },
  ];
  const minimums = verifiedCountries().flatMap((c) =>
    c.englishMinimums ? [{ country: c, fact: c.englishMinimums }] : [],
  );
  const verifiedSlugs = new Set(verifiedExams().map((x) => x.slug));
  const otherExams = PLANNED_EXAMS.filter((p) => p.slug !== e.slug);

  return (
    <div className={`${s.page} flex-1`}>
      <div className={s.band}>
        <div className={`${s.wrap} ${s.examBand}`}>
          <p className={s.crumb}>
            <Link href="/abroad">Study abroad</Link> / Exams
          </p>
          <h1 className={`${s.h1} ${s.h1Exam}`}>
            {e.name} {e.subtitle && <span className={s.serLight}>{e.subtitle}</span>}
          </h1>
          <p className={s.bandLead}>{e.purpose}</p>
          <dl className={s.qgrid}>
            {quick.map((q) => (
              <div key={q.label}>
                <dd>{q.value ?? SOON}</dd>
                <dt>{q.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className={s.wrap}>
        <Sources className={s.statSources} facts={[e.scoreScale, e.duration, e.feeIndia, e.validity]} />
      </div>

      <div className={`${s.wrap} ${s.cgrid}`}>
        <div>
          <Section id="e-format" title="Test" accent="format">
            {e.format ? (
              <>
                <ul className={s.fmt}>
                  {e.format.value.map((p) => (
                    <li key={p.part}>
                      <b>{p.part}</b>
                      <span>{p.detail}</span>
                      <em>{p.time}</em>
                    </li>
                  ))}
                </ul>
                <Sources facts={[e.format]} />
              </>
            ) : (
              <p className={s.mutedP}>
                <span className={s.soonTag}>Coming soon</span>
              </p>
            )}
          </Section>

          {e.descriptors && (
            <Section id="e-bands" title="What does your" accent="band mean?" coral>
              <p className={s.mutedP}>Choose a band to see the official description.</p>
              <BandPicker descriptors={e.descriptors.value} />
              <Sources facts={[e.descriptors]} />
            </Section>
          )}

          <Section id="e-mins" title="Scores countries" accent="ask for">
            {minimums.length > 0 ? (
              <>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th scope="col">Country</th>
                      <th scope="col">Requirement</th>
                      <th scope="col">Official minimum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minimums.flatMap(({ country, fact }) =>
                      fact.value.map((m) => (
                        <tr key={`${country.slug}-${m.label}`}>
                          <td data-label="Country">
                            <Link href={`/abroad/${country.slug}`}>{country.name}</Link>
                          </td>
                          <td data-label="Requirement">{m.label}</td>
                          <td data-label="Official minimum">
                            <b>{m.minimum}</b>
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
                <p className={s.note}>Official minimums only. Each university may ask for a higher score.</p>
                <Sources facts={minimums.map((m) => m.fact)} />
              </>
            ) : (
              <p className={s.mutedP}>
                Official minimums will be listed here, country by country, with their sources.{" "}
                <span className={s.soonTag}>Coming soon</span>
              </p>
            )}
          </Section>

          {e.prepPlan && e.prepPlan.length > 0 && (
            <Section id="e-plan" title="A simple" accent="prep plan" coral>
              <p className={s.mutedP}>Our study advice, not an official requirement.</p>
              <Steps steps={e.prepPlan} />
            </Section>
          )}

          {e.faqs.length > 0 && (
            <Section id="e-faq" title="Questions" accent="students ask">
              <FaqList faqs={e.faqs} />
            </Section>
          )}
        </div>

        <aside className={s.side} aria-label="More exam help">
          <div className={s.sideCard}>
            <h2 className={s.sideTitle}>Practice tests</h2>
            <p className={s.mutedP}>Practice tests with instant scores.</p>
            <span className={`${s.soonTag} ${s.mt}`}>Coming soon</span>
          </div>
          <div className={s.sideCard}>
            <h2 className={s.sideTitle}>Other exams</h2>
            <ul className={s.miniList}>
              {otherExams.map((o) => (
                <li key={o.slug}>
                  {verifiedSlugs.has(o.slug) ? (
                    <Link href={`/abroad/exams/${o.slug}`}>
                      <b>{o.name}</b>
                    </Link>
                  ) : (
                    <b>{o.name}</b>
                  )}
                  <small>
                    {o.purpose}
                    {verifiedSlugs.has(o.slug) ? "" : " · coming soon"}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
