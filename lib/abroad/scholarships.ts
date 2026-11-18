import type { Scholarship } from "./types";

// Scholarships abroad. Each links its official page; what it covers and the deadline are facts with
// a source and date. Draft items never render. Keep imports relative (used by the data check script).

const CHECKED = "2026-11-18";
const CSC_MASTERS = "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/";
const PEARSON = "https://future.utoronto.ca/pearson/about/";

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
];
