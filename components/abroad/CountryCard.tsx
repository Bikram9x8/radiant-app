import Link from "next/link";
import type { Country, Fact, FlagCode, SceneCode } from "@/lib/abroad/types";
import { formatMoney } from "@/lib/abroad/format";
import LandmarkScene from "./scenes/LandmarkScene";
import Flag from "./Flag";
import Sources from "./Sources";
import s from "./abroad.module.css";

type CardRow = { label: string; value: string; fact: Fact<unknown> };

/**
 * The two facts a country card shows: the first that exist, in this order: student visa fee,
 * work after study, work while studying, money to show. Fewer than two if the country has fewer.
 */
export function cardFacts(c: Country, max = 2): CardRow[] {
  const candidates: { label: string; value: string | undefined; fact: Fact<unknown> | undefined }[] = [
    { label: "Student visa fee", value: c.visaFee && formatMoney(c.visaFee.value), fact: c.visaFee },
    { label: "Work after study", value: c.postStudyWork?.value, fact: c.postStudyWork },
    { label: "Work while studying", value: c.workDuringStudy?.value, fact: c.workDuringStudy },
    { label: "Money to show", value: c.visaFundsProof && formatMoney(c.visaFundsProof.value), fact: c.visaFundsProof },
  ];
  return candidates
    .filter((r): r is CardRow => Boolean(r.value && r.fact))
    .slice(0, max);
}

/** Card body: name and the card facts (each fact's source is listed under the card) */
function CardBody({ country: c, heading, rows }: { country: Country; heading: boolean; rows: CardRow[] }) {
  const Title = heading ? "h3" : "span";
  return (
    <span className={s.ccardBody}>
      <Title className={`${s.ccardTitle}${heading ? ` ${s.ccardTitleH}` : ""}`}>
        <Flag code={c.flag} />
        {c.name}
      </Title>
      {rows.map((r) => (
        <span key={r.label} className={s.row}>
          <span>{r.label}</span>
          <b>{r.value}</b>
        </span>
      ))}
    </span>
  );
}

/** A verified country on the hub: scene, name and up to two verified facts with their sources */
export function CountryCard({ country: c }: { country: Country }) {
  const rows = cardFacts(c);
  return (
    <li className={`${s.sceneHost} ${s.ccard}`}>
      <Link href={`/abroad/${c.slug}`} className={s.ccardLink}>
        <span className={s.ccardSky}>
          <LandmarkScene code={c.scene} />
        </span>
        <CardBody country={c} heading={false} rows={rows} />
      </Link>
      <Sources className={s.ccardSources} facts={rows.map((r) => r.fact)} />
    </li>
  );
}

/** Homepage mini card: same facts as the hub card; the name is a heading and the scene scales */
export function MiniCountryCard({ country: c }: { country: Country }) {
  const rows = cardFacts(c);
  return (
    <li className={`${s.sceneHost} ${s.ccard} ${s.ccardMini}`}>
      <Link href={`/abroad/${c.slug}`} className={s.ccardLink}>
        <span className={s.ccardSky}>
          <LandmarkScene code={c.scene} />
        </span>
        <CardBody country={c} heading rows={rows} />
      </Link>
      <Sources className={s.ccardSources} facts={rows.map((r) => r.fact)} />
    </li>
  );
}

/** A planned country with no verified guide yet: drawing and name only, not a link */
export function PlannedCountryCard({
  name,
  flag,
  scene,
  small = false,
}: {
  name: string;
  flag: FlagCode;
  scene: SceneCode;
  /** Compact version (homepage): shorter scene, smaller name */
  small?: boolean;
}) {
  return (
    <li className={`${s.sceneHost} ${s.ccard} ${s.ccardPlanned}${small ? ` ${s.ccardSmall}` : ""}`}>
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
