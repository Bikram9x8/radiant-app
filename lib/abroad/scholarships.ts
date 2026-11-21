import type { Scholarship } from "./types";

// Scholarships abroad. Each links its official page; what it covers and the deadline are facts with
// a source and date. Draft items never render. Keep imports relative (used by the data check script).

const CHECKED = "2026-11-18";
const CSC_MASTERS = "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/";
const PEARSON = "https://future.utoronto.ca/pearson/about/";

// Batch 2 (Germany, Australia) was checked on a later day
const CHECKED_2 = "2026-11-20";
const DAAD_EPOS =
  "https://www.daad.in/en/find-funding/scholarship-database/?type=a&q=&status=0&subject=0&onlydaad=0&detail_to_show=0&target=4&origin=4&pg=3&tab=&intention=&detail_to_show=50076777";
const UQ_GRS = "https://scholarships.uq.edu.au/scholarship/graduate-school-scholarships-uqgss-%E2%80%93-includes-rtp";

export const SCHOLARSHIPS: Scholarship[] = [
  {
    slug: "chevening",
    name: "Chevening Scholarships",
    status: "verified",
    provider: "UK government (Chevening)",
    flag: "uk",
    countries: ["uk"],
    levels: ["Masters"],
    covers: {
      value: "Tuition, a monthly stipend, economy travel to and from the UK, arrival and departure allowances and the visa cost",
      sourceUrl: "https://chevening.org/faqs/what-does-a-chevening-scholarship-cover/",
      sourceName: "Chevening",
      lastChecked: CHECKED,
      note: "One-year master's. Needs at least two years' work experience and a commitment to return home for two years.",
    },
    deadline: {
      value: "2027–28 applications are closed. Applications usually open in August and close in October.",
      sourceUrl: "https://chevening.org/scholarships/application-timeline/",
      sourceName: "Chevening",
      lastChecked: CHECKED,
      note: "Dates for the next round are not yet published.",
    },
    officialUrl: "https://www.chevening.org/scholarship/india/",
    tags: ["Fully funded", "1-year master's", "2 years' work experience"],
  },
  {
    slug: "commonwealth-masters",
    name: "Commonwealth Master's Scholarships",
    status: "verified",
    provider: "Commonwealth Scholarship Commission in the UK",
    flag: "uk",
    countries: ["uk"],
    levels: ["Masters"],
    covers: {
      value: "Airfare, full tuition, a stipend of £1,712 a month (£2,000 in London) and a study travel grant",
      sourceUrl: CSC_MASTERS,
      sourceName: "Commonwealth Scholarship Commission in the UK",
      lastChecked: CHECKED,
      note: "One-year taught master's at a UK university. India is an eligible country.",
    },
    deadline: {
      value: "2027–28 round closed on 20 October 2026. You apply through a nominating body.",
      sourceUrl: CSC_MASTERS,
      sourceName: "Commonwealth Scholarship Commission in the UK",
      lastChecked: CHECKED,
    },
    officialUrl: CSC_MASTERS,
    tags: ["Fully funded", "1-year master's", "Needs nomination"],
  },
  {
    slug: "lester-b-pearson",
    name: "Lester B. Pearson International Scholarship",
    status: "verified",
    provider: "University of Toronto",
    flag: "ca",
    countries: ["canada"],
    levels: ["Bachelors"],
    covers: {
      value: "Tuition, books, incidental fees and full residence support for four years",
      sourceUrl: PEARSON,
      sourceName: "University of Toronto",
      lastChecked: CHECKED,
      note: "About 37 awards each year, for international students starting an undergraduate degree.",
    },
    deadline: {
      value: "This year's round is closed (school nomination deadline was 9 October 2026)",
      sourceUrl: PEARSON,
      sourceName: "University of Toronto",
      lastChecked: CHECKED,
      note: "Your school must nominate you.",
    },
    officialUrl: PEARSON,
    tags: ["Fully funded", "Undergraduate", "Needs school nomination"],
  },
  {
    slug: "daad-epos",
    name: "DAAD Development-Related Postgraduate Courses (EPOS)",
    status: "verified",
    provider: "DAAD (German Academic Exchange Service)",
    flag: "de",
    countries: ["germany"],
    levels: ["Masters"],
    covers: {
      value: "992 euros a month for graduates, health, accident and personal liability insurance, and a travel allowance",
      sourceUrl: DAAD_EPOS,
      sourceName: "DAAD India",
      lastChecked: CHECKED_2,
      note: "For graduates with at least two years' work experience, for a postgraduate or master's course at a German university (12 to 42 months). India is on the DAAD's EPOS country list.",
    },
    deadline: {
      value: "Depends on the course: each EPOS course lists its own deadline for 2027/28",
      sourceUrl: DAAD_EPOS,
      sourceName: "DAAD India",
      lastChecked: CHECKED_2,
    },
    officialUrl: DAAD_EPOS,
    tags: ["Monthly stipend", "Master's", "2 years' work experience"],
  },
  {
    slug: "uq-graduate-research",
    name: "UQ Graduate Research School Scholarship (includes RTP)",
    status: "verified",
    provider: "The University of Queensland",
    flag: "au",
    countries: ["australia"],
    levels: ["PhD"],
    covers: {
      value: "A living stipend of AUD 39,220 a year (2026 rate, tax free), tuition fees and single Overseas Student Health Cover",
      sourceUrl: UQ_GRS,
      sourceName: "The University of Queensland",
      lastChecked: CHECKED_2,
      note: "For research degrees (PhD, MPhil), open to international students. 3.5 years, with a possible extension.",
    },
    deadline: {
      value: "Next listed round (2027 Round 1) closes 25 January 2027",
      sourceUrl: UQ_GRS,
      sourceName: "The University of Queensland",
      lastChecked: CHECKED_2,
      note: "You apply by sending an expression of interest for a UQ research program; there is no separate scholarship form.",
    },
    officialUrl: UQ_GRS,
    tags: ["Stipend + tuition", "Research degree"],
  },
];
