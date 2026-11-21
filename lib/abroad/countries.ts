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

// Batch 2 (Australia, Germany) was checked on a later day
const CHECKED_2 = "2026-11-20";

// ---- Australia (Department of Home Affairs, Study Australia) ----
const HOME_AFFAIRS = "Department of Home Affairs (Australian Government)";
const AU_500 = "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500";
const AU_485 = "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485";

const auStep = (text: string): Fact<string> => ({
  value: text,
  sourceUrl: AU_500,
  sourceName: HOME_AFFAIRS,
  lastChecked: CHECKED_2,
});

// ---- Germany (Federal Foreign Office) ----
const FFO = "Federal Foreign Office (Germany)";
const DE_FAQ = "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/606850-606850";

const deStep = (text: string): Fact<string> => ({
  value: text,
  sourceUrl: DE_FAQ,
  sourceName: FFO,
  lastChecked: CHECKED_2,
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
  {
    slug: "australia",
    name: "Australia",
    flag: "au",
    scene: "au",
    status: "verified",
    currency: "AUD",
    visaFee: {
      value: { amount: 2500, currency: "AUD" },
      sourceUrl: AU_500,
      sourceName: HOME_AFFAIRS,
      lastChecked: CHECKED_2,
      note: "Student visa (subclass 500), from AUD 2,500 for the main applicant (concessions apply in limited circumstances).",
    },
    visaFundsProof: {
      value: { amount: 29710, currency: "AUD" },
      sourceUrl: AU_500,
      sourceName: HOME_AFFAIRS,
      lastChecked: CHECKED_2,
      note: "12-month living costs for a student. You also need 12 months of course fees and travel costs.",
    },
    workDuringStudy: {
      value: "Up to 48 hours a fortnight while your course is in session",
      sourceUrl: AU_500,
      sourceName: HOME_AFFAIRS,
      lastChecked: CHECKED_2,
    },
    postStudyWork: {
      value: "Usually 2 to 3 years (subclass 485)",
      sourceUrl: AU_485,
      sourceName: HOME_AFFAIRS,
      lastChecked: CHECKED_2,
      note: "Temporary Graduate visa, Post-Higher Education Work stream: usually between 2 and 3 years depending on your qualification. From AUD 5,750; you must be 35 or under when you apply (exceptions apply).",
    },
    intakes: {
      value: ["March"],
      sourceUrl: "https://studyaustralia.gov.au/en/plan-your-studies/australias-education-system",
      sourceName: "Study Australia (Australian Government)",
      lastChecked: CHECKED_2,
      note: "University courses usually start in March, but it can vary by course and provider.",
    },
    mainIntake: "March",
    englishMinimums: {
      value: [
        { label: "IELTS Academic", minimum: "6.0" },
        { label: "PTE Academic", minimum: "47" },
        { label: "TOEFL iBT", minimum: "67" },
      ],
      sourceUrl: AU_500,
      sourceName: HOME_AFFAIRS,
      lastChecked: CHECKED_2,
      note: "For tests taken on or after 7 August 2025, with no English course (ELICOS) before your main course. Lower scores apply if you do one.",
    },
    visaSteps: [
      {
        title: "Before you apply",
        text: "Get your Confirmation of Enrolment from your course provider and arrange Overseas Student Health Cover (OSHC).",
        source: auStep("Step: Before you apply"),
      },
      {
        title: "Gather your documents",
        text: "Identity, enrolment, Genuine Student, English test and money documents.",
        source: auStep("Step: Gather your documents"),
      },
      {
        title: "Apply for the visa",
        text: "Apply online through ImmiAccount. The visa costs from AUD 2,500.",
        source: auStep("Step: Apply for the visa"),
      },
      {
        title: "After you apply",
        text: "Wait for a decision, and reply if you're asked for more information.",
        source: auStep("Step: After you apply"),
      },
      {
        title: "Visa outcome",
        text: "Home Affairs tells you the decision on your application.",
        source: auStep("Step: Visa outcome"),
      },
    ],
    faqs: [
      {
        q: "Did the student visa fee go up?",
        a: "Yes. The Student visa application charge increased from AUD 2,000 to AUD 2,500 from 1 July 2026.",
        source: {
          value: "The Student VAC increased from AUD $2,000 to AUD $2,500 from 1 July 2026.",
          sourceUrl: "https://www.studyaustralia.gov.au/en/Agent-Hub/agent-news-index/student-visa-application-charge-increase",
          sourceName: "Study Australia (Australian Government)",
          lastChecked: CHECKED_2,
        },
      },
    ],
  },
  {
    slug: "germany",
    name: "Germany",
    flag: "de",
    scene: "de",
    status: "verified",
    currency: "EUR",
    visaFee: {
      value: { amount: 75, currency: "EUR" },
      sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/215870-215870",
      sourceName: FFO,
      lastChecked: CHECKED_2,
      note: "National visa (for longer stays). People with a scholarship from public funds may not have to pay.",
    },
    workDuringStudy: {
      value: "Up to 140 full days or 280 half days a year (a day of up to 4 hours counts as half)",
      sourceUrl: "https://www.make-it-in-germany.com/en/study-vocational-training/studying-in-germany/work",
      sourceName: "Make it in Germany (Federal Government portal)",
      lastChecked: CHECKED_2,
      note: "Verified manually; the site blocks automated reading.",
    },
    visaSteps: [
      {
        title: "Get admission to a university",
        text: "You need documents showing that a German university has accepted you.",
        source: deStep("Documents have to be presented proving inter alia that the applicant has been accepted for studies by the university."),
      },
      {
        title: "Apply for a student visa before you travel",
        text: "Apply to the German mission (embassy or consulate) for your area before travelling to Germany.",
        source: deStep("If you plan to study in Germany, you have to submit an application for a student visa to the respective German mission abroad before travelling."),
      },
      {
        title: "Show how you will pay for your stay",
        text: "For example with money in a blocked account in Germany, or a bank guarantee.",
        source: deStep("by paying a security into a blocked account in Germany, or by depositing an annually renewable bank guarantee at a bank in Germany"),
      },
      {
        title: "Wait for the foreigners authority",
        text: "The mission sends your application to the foreigners authority in your university's town, and issues the visa once it agrees.",
        source: deStep("The German mission abroad can only issue the visa for entry once the foreigners authority has given its approval."),
      },
    ],
    faqs: [
      {
        q: "Do international students pay tuition in Baden-Württemberg?",
        a: "Yes. Since the 2017/18 winter semester, students who come from outside the EU to study pay 1,500 euros per semester at universities in Baden-Württemberg. The university decides on exceptions.",
        source: {
          value: "1,500 euros per semester for students from outside the EU",
          sourceUrl:
            "https://mwk.baden-wuerttemberg.de/de/hochschulen-studium/studieren-in-bw/studienfinanzierung/gebuehren-fuer-internationale-studierende-und-zweitstudium",
          sourceName: "Ministry of Science, Research and Arts Baden-Württemberg",
          lastChecked: CHECKED_2,
        },
      },
    ],
  },
];
