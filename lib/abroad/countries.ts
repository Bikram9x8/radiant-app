import type { Country, Fact } from "./types";

// Study-abroad countries. Every fact is copied from an official source, with its URL and the date
// checked, and reviewed before an item is marked "verified". Draft items never render.
// Keep imports relative (no "@/"): scripts/check-abroad-data.ts loads this file outside Next.

const CHECKED = "2026-11-18";

// ---- Canada (IRCC, canada.ca) ----
const IRCC = "IRCC (Government of Canada)";
const CA_APPLY =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/apply.html";

const caStep = (text: string): Fact<string> => ({
  value: text,
  sourceUrl: CA_APPLY,
  sourceName: IRCC,
  lastChecked: CHECKED,
});

// ---- United Kingdom (gov.uk) ----
const UKVI = "UK Visas and Immigration (GOV.UK)";
const UK_APPLY = "https://www.gov.uk/student-visa/apply";

const ukStep = (text: string): Fact<string> => ({
  value: text,
  sourceUrl: UK_APPLY,
  sourceName: UKVI,
  lastChecked: CHECKED,
});

export const COUNTRIES: Country[] = [
  {
    slug: "canada",
    name: "Canada",
    flag: "ca",
    scene: "ca",
    status: "verified",
    currency: "CAD",
    visaFee: {
      value: { amount: 150, currency: "CAD" },
      sourceUrl: "https://ircc.canada.ca/english/information/fees/fees.asp",
      sourceName: IRCC,
      lastChecked: CHECKED,
      note: "Study permit fee per person. Biometrics are a separate fee.",
    },
    visaFundsProof: {
      value: { amount: 23448, currency: "CAD" },
      sourceUrl:
        "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html",
      sourceName: IRCC,
      lastChecked: CHECKED,
      note: "For one person for one year, outside Quebec, for applications on or after 1 September 2026. This is on top of tuition and travel.",
    },
    workDuringStudy: {
      value: "Up to 24 hours a week off campus during regular terms; no limit during scheduled breaks",
      sourceUrl:
        "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/work-off-campus.html",
      sourceName: IRCC,
      lastChecked: CHECKED,
      note: "Only if you meet IRCC's conditions for working off campus.",
    },
    postStudyWork: {
      value: "Up to 3 years (PGWP)",
      sourceUrl:
        "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html",
      sourceName: IRCC,
      lastChecked: CHECKED,
      note: "Post-Graduation Work Permit. Its length depends on your program's level and length, and it can't be longer than your passport is valid.",
    },
    visaSteps: [
      {
        title: "Make sure you have what you need",
        text: "Including a letter of acceptance and, in most cases, a provincial or territorial attestation letter (PAL/TAL).",
        source: caStep("Step 1: Make sure you have what you need"),
      },
      {
        title: "Read the instruction guide",
        text: "IRCC's guide explains each form and document for your application.",
        source: caStep("Step 2: Read the instruction guide"),
      },
      {
        title: "Prepare your answers for the online tool",
        text: "The online tool asks questions to build your personal document checklist.",
        source: caStep("Step 3: Prepare your answers for the online tool"),
      },
      {
        title: "Know the fees you have to pay",
        text: "The study permit fee and, in most cases, the biometrics fee.",
        source: caStep("Step 4: Know the fees you have to pay"),
      },
      {
        title: "Create your online account or sign in",
        text: "You apply online from outside Canada through your IRCC account.",
        source: caStep("Step 5: Create your online account or sign in"),
      },
    ],
    faqs: [
      {
        q: "Do I pay for biometrics separately?",
        a: "Yes. Biometrics (fingerprints and photo) cost CAD 85 for one person, on top of the study permit fee.",
        source: {
          value: "Biometrics fee CAD 85",
          sourceUrl: CA_APPLY,
          sourceName: IRCC,
          lastChecked: CHECKED,
        },
      },
    ],
  },
  {
    slug: "uk",
    name: "United Kingdom",
    flag: "uk",
    scene: "uk",
    status: "verified",
    currency: "GBP",
    // No official UK-wide tuition figure: each university sets its own fees
    tuitionSetByUniversity: true,
    visaFundsMonthly: {
      value: {
        amounts: [
          { label: "outside London", amount: { amount: 1171, currency: "GBP" } },
          { label: "in London", amount: { amount: 1529, currency: "GBP" } },
        ],
        maxMonths: 9,
      },
      sourceUrl: "https://www.gov.uk/student-visa/money",
      sourceName: UKVI,
      lastChecked: CHECKED,
    },
    visaFee: {
      value: { amount: 558, currency: "GBP" },
      sourceUrl: "https://www.gov.uk/student-visa",
      sourceName: UKVI,
      lastChecked: CHECKED,
      note: "To apply from outside the UK. The Immigration Health Surcharge is paid separately.",
    },
    workDuringStudy: {
      value: "Degree level and above: up to 20 hours a week in term time, full time outside term time (below degree level: 10 hours)",
      sourceUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-student",
      sourceName: "Immigration Rules, Appendix Student (GOV.UK)",
      lastChecked: CHECKED,
      note: "Paragraph ST 26.1. Applies to full-time courses at a higher education provider with a track record of compliance. Part-time students can't work.",
    },
    postStudyWork: {
      value: "18 months to 2 years (PhD: 3 years)",
      sourceUrl: "https://www.gov.uk/graduate-visa",
      sourceName: UKVI,
      lastChecked: CHECKED,
      note: "Graduate visa: 2 years if you apply on or before 31 December 2026, 18 months if you apply on or after 1 January 2027.",
    },
    examsAccepted: {
      value: ["IELTS for UKVI", "PTE Academic UKVI", "Skills for English UKVI", "LanguageCert"],
      sourceUrl:
        "https://www.gov.uk/guidance/prove-your-english-language-abilities-with-a-secure-english-language-test-selt",
      sourceName: "Home Office (GOV.UK)",
      lastChecked: CHECKED,
      note: "Approved Secure English Language Tests (SELT) taken outside the UK. Your university may accept other ways to prove your English.",
    },
    englishMinimums: {
      value: [
        { label: "Degree level and above", minimum: "CEFR B2" },
        { label: "Below degree level", minimum: "CEFR B1" },
      ],
      sourceUrl: "https://www.gov.uk/student-visa/knowledge-of-english",
      sourceName: UKVI,
      lastChecked: CHECKED,
    },
    visaSteps: [
      {
        title: "Check if this visa is right for you",
        text: "You need an offer from a licensed student sponsor, enough money and the required English level.",
        source: ukStep("Step 1: Check if this visa is right for you"),
      },
      {
        title: "Prepare the evidence you need",
        text: "Your documents, proof of English, a TB test if needed, and ATAS clearance for some master's and above.",
        source: ukStep("Step 2: Prepare the evidence you need"),
      },
      {
        title: "Apply from outside the UK",
        text: "You can apply up to 6 months before your course starts, and you'll need to prove your identity.",
        source: ukStep("Step 3: Apply from outside the UK"),
      },
      {
        title: "Get your decision",
        text: "You'll usually get a decision within 3 weeks if you apply from outside the UK.",
        source: ukStep("You'll usually get a decision on your visa within 3 weeks, if you're outside the UK"),
      },
      {
        title: "Get access to your eVisa",
        text: "If you're approved you get an eVisa, which you access through a UKVI account.",
        source: ukStep("Step 4: Get access to your eVisa"),
      },
    ],
    faqs: [
      {
        q: "What is the Immigration Health Surcharge?",
        a: "A fee for using the NHS while you're in the UK. For students it is £776 a year, paid when you apply for the visa.",
        source: {
          value: "£776 per year for students",
          sourceUrl: "https://www.gov.uk/healthcare-immigration-application/how-much-pay",
          sourceName: "GOV.UK",
          lastChecked: CHECKED,
        },
      },
    ],
  },
];
