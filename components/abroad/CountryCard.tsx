import Link from "next/link";
import type { Country, Fact, FlagCode, SceneCode } from "@/lib/abroad/types";
import { formatInrShort, formatMoney, formatMoneyRange, toInr } from "@/lib/abroad/format";
import { getRate } from "@/lib/abroad";
import LandmarkScene from "./scenes/LandmarkScene";
import Flag from "./Flag";
import Sources from "./Sources";
import { TUITION_BY_UNI, TUITION_BY_UNI_HINT } from "./CountryParts";
import s from "./abroad.module.css";

const SOON = <span className={s.soonInline}>Coming soon</span>;

/** A verified country: real facts only, each with its source line; missing facts say "Coming soon" */
export function CountryCard({ country: c }: { country: Country }) {
  const rate = getRate(c.currency);
  const inr = (r: Country["tuitionPerYear"]) =>
    r && rate
      ? ` (≈ ${formatInrShort(toInr(r.value.min.amount, rate.value))} to ${formatInrShort(toInr(r.value.max.amount, rate.value))})`
      : "";

  return (
    <li className={`${s.sceneHost} ${s.ccard}`}>
      <Link href={`/abroad/${c.slug}`} className={s.ccardLink}>
        <span className={s.ccardSky}>
          <LandmarkScene code={c.scene} />
        </span>
        <span className={s.ccardBody}>
          <span className={s.ccardTitle}>
            <Flag code={c.flag} />
            {c.name}
          </span>
          <span className={s.row}>
            <span>Tuition / year</span>
            <b>
              {c.tuitionPerYear
                ? formatMoneyRange(c.tuitionPerYear.value) + inr(c.tuitionPerYear)
                : c.tuitionSetByUniversity
                  ? TUITION_BY_UNI
                  : SOON}
            </b>
          </span>
          {!c.tuitionPerYear && c.tuitionSetByUniversity && <span className={s.ccardHint}>{TUITION_BY_UNI_HINT}</span>}
          <span className={s.row}>
            <span>Living / year</span>
            <b>{c.livingPerYear ? formatMoneyRange(c.livingPerYear.value) + inr(c.livingPerYear) : SOON}</b>
          </span>
          <span className={s.row}>
            <span>Work after study</span>
            <b>{c.postStudyWork ? c.postStudyWork.value : SOON}</b>
          </span>
          <span className={s.row}>
            <span>Main intake</span>
            <b>{c.mainIntake && c.intakes ? c.mainIntake : SOON}</b>
          </span>
        </span>
      </Link>
      <Sources
        className={s.ccardSources}
        facts={[c.tuitionPerYear, c.livingPerYear, c.postStudyWork, c.intakes, (c.tuitionPerYear || c.livingPerYear) && rate]}
      />
    </li>
  );
}

/**
 * Homepage mini card for a verified country: landmark scene, name and the first two verified facts
 * (visa fee, work after study, ...) with their source lines. Never shows an unverified number.
 */
export function MiniCountryCard({ country: c }: { country: Country }) {
  const candidates: { label: string; value: string | undefined; fact: Fact<unknown> | undefined }[] = [
    { label: "Student visa fee", value: c.visaFee && formatMoney(c.visaFee.value), fact: c.visaFee },
    { label: "Work after study", value: c.postStudyWork?.value, fact: c.postStudyWork },
    { label: "Work while studying", value: c.workDuringStudy?.value, fact: c.workDuringStudy },
  ];
  const rows = candidates.filter((r) => r.value && r.fact).slice(0, 2);

  return (
    <li className={`${s.sceneHost} ${s.ccard} ${s.ccardMini}`}>
      <Link href={`/abroad/${c.slug}`} className={s.ccardLink}>
        <span className={s.ccardSky}>
          <LandmarkScene code={c.scene} />
        </span>
        <span className={s.ccardBody}>
          <h3 className={`${s.ccardTitle} ${s.ccardTitleH}`}>
            <Flag code={c.flag} />
            {c.name}
          </h3>
          {rows.map((r) => (
            <span key={r.label} className={s.row}>
              <span>{r.label}</span>
              <b>{r.value}</b>
            </span>
          ))}
        </span>
      </Link>
      <Sources className={s.ccardSources} facts={rows.map((r) => r.fact)} />
    </li>
  );
}

/** A planned country with no verified guide yet: drawing and name only, not a link */
export function PlannedCountryCard({ name, flag, scene }: { name: string; flag: FlagCode; scene: SceneCode }) {
  return (
    <li className={`${s.sceneHost} ${s.ccard} ${s.ccardPlanned}`}>
      <span className={s.ccardSky}>
        <LandmarkScene code={scene} />
      </span>
      <span className={s.ccardBody}>
        <span className={s.ccardTitle}>
          <Flag code={flag} />
          {name}
        </span>
        <span className={s.soonTag}>Guide coming soon</span>
      </span>
    </li>
  );
}
