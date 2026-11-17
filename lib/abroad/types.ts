// Study Abroad content types. Every number or rule shown to students is a Fact: it carries the
// official page it came from and the date someone last checked it. Pages render facts only through
// the <Fact> component (source line included) and never show a bare number.
//
// Items have a status: only "verified" items are listed on the site; "draft" items never render.
// A verified item may leave a fact out; the page then says "Coming soon" instead of a number.
// scripts/check-abroad-data.ts (run before every build) fails on a fact without a source or date.

/** ISO date "YYYY-MM-DD" */
export type IsoDate = string;

export type Fact<T> = {
  value: T;
  /** Official page the value comes from (https) */
  sourceUrl: string;
  /** Who publishes it, e.g. "IRCC (Government of Canada)" */
  sourceName: string;
  /** When the value was last checked against the source */
  lastChecked: IsoDate;
  /** Optional context, e.g. "for the 2026–27 intake" */
  note?: string;
};

export type Currency = "CAD" | "GBP" | "USD" | "AUD" | "EUR" | "NZD" | "INR";

export type Money = { amount: number; currency: Currency };

export type Range<T> = { min: T; max: T };

export type Status = "draft" | "verified";

/** Flag drawings available in components/abroad/Flag.tsx */
export type FlagCode = "ca" | "uk" | "us" | "au" | "de" | "ie" | "nz" | "eu";

/** Landmark scenes available in components/abroad/scenes */
export type SceneCode = "ca" | "uk" | "us" | "au" | "de" | "ie";

export type Step = { title: string; text: string; source?: Fact<string> };

export type Faq = { q: string; a: string; source?: Fact<string> };

export type Country = {
  slug: string;
  name: string;
  flag: FlagCode;
  scene: SceneCode;
  status: Status;
  /** One line under the title, e.g. "Popular for post-study work and quality degrees" */
  summary?: string;
  currency: Currency;
  tuitionPerYear?: Fact<Range<Money>>;
  livingPerYear?: Fact<Range<Money>>;
  visaFundsProof?: Fact<Money>;
  visaFee?: Fact<Money>;
  workDuringStudy?: Fact<string>;
  postStudyWork?: Fact<string>;
  intakes?: Fact<string[]>;
  mainIntake?: string;
  examsAccepted?: Fact<string[]>;
  /** Official English-test minimums only (e.g. a student-visa level), never "typical" ranges */
  englishMinimums?: Fact<{ label: string; minimum: string }[]>;
  visaSteps: Step[];
  faqs: Faq[];
};

export type ExamPart = { part: string; detail: string; time: string };

export type Exam = {
  slug: string;
  name: string;
  status: Status;
  /** e.g. "English test for study abroad" */
  purpose: string;
  scoreScale?: Fact<string>;
  duration?: Fact<string>;
  format?: Fact<ExamPart[]>;
  feeIndia?: Fact<Money>;
  validity?: Fact<string>;
  /** Official band/score descriptors, e.g. IELTS bands 1–9 */
  descriptors?: Fact<Record<string, string>>;
  faqs: Faq[];
};

export type Level = "Bachelors" | "Masters" | "PhD";

export type Scholarship = {
  slug: string;
  name: string;
  status: Status;
  provider: string;
  flag: FlagCode;
  /** Country slugs it applies to (for the country filter and country pages) */
  countries: string[];
  levels: Level[];
  covers?: Fact<string>;
  deadline?: Fact<string>;
  /** The scholarship's official page */
  officialUrl: string;
  tags: string[];
};

/** Rupees per one unit of a currency, e.g. an RBI reference rate */
export type ExchangeRate = Fact<number> & { currency: Exclude<Currency, "INR"> };
