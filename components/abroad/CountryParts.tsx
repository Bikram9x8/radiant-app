import Link from "next/link";
import type { Country, Fact, Faq, Step } from "@/lib/abroad/types";
import { formatInrShort, formatMoney, formatMoneyRange, toInr } from "@/lib/abroad/format";
import { getRate } from "@/lib/abroad";
import LandmarkScene from "./scenes/LandmarkScene";
import Flag from "./Flag";
import Sources from "./Sources";
import s from "./abroad.module.css";


/** Shown when a country deliberately has no national tuition figure (Country.tuitionSetByUniversity) */
export const TUITION_BY_UNI = "Set by each university";
export const TUITION_BY_UNI_HINT = "No official national figure. Check each university's fees page.";

/** "A, B + 2 more" for long lists in small spaces (the full list is shown elsewhere) */
export function shortList(items: string[], keep = 2) {
  return items.length > keep ? `${items.slice(0, keep).join(", ")} + ${items.length - keep} more` : items.join(", ");
}

/** Dark header band: crumb, title, summary, links to the other guides, landmark scene */
export function CountryHeader({ country: c, others }: { country: Country; others: Country[] }) {
  return (
    <div className={s.band}>
      <div className={`${s.wrap} ${s.cbandGrid}`}>
        <div>
          <p className={s.crumb}>
            <Link href="/abroad">Study abroad</Link> / {c.name}
          </p>
          <h1 className={`${s.h1} ${s.h1Country}`}>
            <Flag code={c.flag} className={s.flagBig} />
            <span>
              Study in <span className={s.serLight}>{c.name}</span>
            </span>
          </h1>
          {c.summary && <p className={s.bandLead}>{c.summary}</p>}
          {others.length > 0 && (
            <nav aria-label="Other country guides" className={s.chipRow}>
              {others.map((o) => (
                <Link key={o.slug} href={`/abroad/${o.slug}`} className={s.chipLink}>
                  {o.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className={`${s.sceneHost} ${s.heroScene}`}>
          <LandmarkScene code={c.scene} />
        </div>
      </div>
    </div>
  );
}

/** Five headline numbers under the band; each from a fact (sources listed underneath) */
export function StatStrip({ country: c }: { country: Country }) {
  const rate = getRate(c.currency);
  const fromInr = (f?: Fact<{ min: { amount: number } }>) =>
    f && rate ? ` · ≈ ${formatInrShort(toInr(f.value.min.amount, rate.value))}+` : "";
  const tuition: React.ReactNode = c.tuitionPerYear ? (
    formatMoney(c.tuitionPerYear.value.min) + fromInr(c.tuitionPerYear)
  ) : c.tuitionSetByUniversity ? (
    <>
      {TUITION_BY_UNI}
      <small className={s.statHint}>{TUITION_BY_UNI_HINT}</small>
    </>
  ) : null;
  // Only facts that exist are shown; empty stats are left out (no "Coming soon" cards)
  const stats = [
    { label: c.tuitionPerYear ? "Tuition per year from" : "Tuition per year", value: tuition },
    { label: "Living per year from", value: c.livingPerYear ? formatMoney(c.livingPerYear.value.min) + fromInr(c.livingPerYear) : null },
    { label: "Work after study", value: c.postStudyWork?.value ?? null },
    { label: "Intakes", value: c.intakes ? c.intakes.value.join(", ") : null },
    { label: "Exams accepted", value: c.examsAccepted ? shortList(c.examsAccepted.value) : null },
  ].filter((st) => st.value !== null);
  if (stats.length === 0) return null;
  return (
    <div className={s.wrap}>
      <dl className={s.stats}>
        {stats.map((st) => (
          <div key={st.label}>
            <dd>{st.value}</dd>
            <dt>{st.label}</dt>
          </div>
        ))}
      </dl>
      <Sources
        className={s.statSources}
        facts={[c.tuitionPerYear, c.livingPerYear, c.postStudyWork, c.intakes, c.examsAccepted, (c.tuitionPerYear || c.livingPerYear) && rate]}
      />
    </div>
  );
}

/** A white section card with a display heading */
export function Section({
  id,
  title,
  accent,
  coral,
  children,
}: {
  id: string;
  title: string;
  accent?: string;
  coral?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={s.sec} aria-labelledby={id}>
      <h2 id={id} className={`${s.h2} ${s.secTitle}`}>
        {title} {accent && <span className={`${s.ser} ${coral ? s.serCoral : ""}`}>{accent}</span>}
      </h2>
      {children}
    </section>
  );
}

/** Label / value rows (money for the visa, work rights, English minimums) */
export function FactRows({ rows }: { rows: { label: string; value: React.ReactNode | null }[] }) {
  // Rows without a verified fact are left out (no "Coming soon" rows); nothing at all if none are left
  const shown = rows.filter((r) => r.value !== null && r.value !== undefined);
  if (shown.length === 0) return null;
  return (
    <dl className={s.qf}>
      {shown.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function money(f?: Fact<{ amount: number; currency: Parameters<typeof formatMoney>[0]["currency"] }>) {
  return f ? formatMoney(f.value) : null;
}

export function moneyRange(f?: Country["tuitionPerYear"]) {
  return f ? formatMoneyRange(f.value) : null;
}

/** Numbered steps (visa); a step can carry its own source */
export function Steps({ steps }: { steps: Step[] }) {
  return (
    <>
      <ol className={s.steps}>
        {steps.map((st) => (
          <li key={st.title}>
            <b>{st.title}</b>
            <span>{st.text}</span>
          </li>
        ))}
      </ol>
      <Sources facts={steps.map((st) => st.source)} />
    </>
  );
}

/** Questions and answers (native details/summary: keyboard and screen-reader friendly) */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <>
      {faqs.map((f) => (
        <details key={f.q} className={s.faq}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
      <Sources facts={faqs.map((f) => f.source)} />
    </>
  );
}
