"use client";

import { useId, useMemo, useState } from "react";
import type { Fact, Money, Range } from "@/lib/abroad/types";
import { formatInrShort } from "@/lib/abroad/format";
import Sources from "./Sources";
import s from "./abroad.module.css";

// Cost planner. Uses ONLY verified figures (tuition and living ranges and a dated exchange rate),
// passed in by the server page; the visitor picks the course length, a point in the range and
// can move the exchange rate. The result is labelled an estimate, with every source listed.
export type CalcCountry = {
  slug: string;
  name: string;
  currency: string;
  tuition: Fact<Range<Money>>;
  living: Fact<Range<Money>>;
  rate: Fact<number>;
};

export default function CostCalculator({ countries }: { countries: CalcCountry[] }) {
  const id = useId();
  const [slug, setSlug] = useState(countries[0]?.slug ?? "");
  const country = countries.find((c) => c.slug === slug) ?? countries[0];
  const [years, setYears] = useState(2);
  const [level, setLevel] = useState(50);
  // Rate per country, starting at the official rate
  const [rates, setRates] = useState<Record<string, number>>(() =>
    Object.fromEntries(countries.map((c) => [c.slug, c.rate.value])),
  );
  const rate = rates[country.slug];
  const official = country.rate.value;

  const result = useMemo(() => {
    const t = level / 100;
    const pick = (r: Range<Money>) => r.min.amount + (r.max.amount - r.min.amount) * t;
    const tuition = pick(country.tuition.value) * years * rate;
    const living = pick(country.living.value) * years * rate;
    return { tuition, living, total: tuition + living, max: Math.max(tuition, living) || 1 };
  }, [country, years, level, rate]);

  return (
    <div className={s.calc}>
      <div>
        {/* A choice only when there is more than one country (the hub); a country page shows its own */}
        {countries.length > 1 && (
          <div className={s.field}>
            <label htmlFor={`${id}-c`}>Country</label>
            <select id={`${id}-c`} value={country.slug} onChange={(e) => setSlug(e.target.value)}>
              {countries.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={s.field}>
          <label htmlFor={`${id}-y`}>
            Course length: <b>{years === 1 ? "1 year" : `${years} years`}</b>
          </label>
          <input id={`${id}-y`} type="range" min={1} max={4} step={0.5} value={years} onChange={(e) => setYears(+e.target.value)} />
        </div>
        <div className={s.field}>
          <label htmlFor={`${id}-t`}>
            Within the official range: <b>{level < 34 ? "Lower" : level < 67 ? "Middle" : "Higher"}</b>
          </label>
          <input id={`${id}-t`} type="range" min={0} max={100} step={5} value={level} onChange={(e) => setLevel(+e.target.value)} />
        </div>
        <div className={s.field}>
          <label htmlFor={`${id}-r`}>
            Exchange rate: <b>₹{rate.toFixed(2)} per {country.currency}</b>
          </label>
          <input
            id={`${id}-r`}
            type="range"
            min={+(official * 0.7).toFixed(2)}
            max={+(official * 1.3).toFixed(2)}
            step={0.25}
            value={rate}
            onChange={(e) => setRates((r) => ({ ...r, [country.slug]: +e.target.value }))}
          />
        </div>
      </div>
      <div>
        <p className={s.note}>Estimated total for the whole course</p>
        <p className={s.big} aria-live="polite">
          {formatInrShort(result.total)}
        </p>
        <div className={s.cbars}>
          <div className={s.cb}>
            <span>Tuition</span>
            <span className={s.track}>
              <i style={{ width: `${(result.tuition / result.max) * 100}%` }} />
            </span>
            <span>{formatInrShort(result.tuition)}</span>
          </div>
          <div className={s.cb}>
            <span>Living</span>
            <span className={s.track}>
              <i className={s.living} style={{ width: `${(result.living / result.max) * 100}%` }} />
            </span>
            <span>{formatInrShort(result.living)}</span>
          </div>
        </div>
        <p className={s.note}>Estimate only. Excludes flights, visa fee and health cover.</p>
        <Sources facts={[country.tuition, country.living, country.rate]} />
      </div>
    </div>
  );
}
