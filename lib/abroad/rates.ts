import type { ExchangeRate } from "./types";

// Rupees per unit of each currency, for converting fees to rupees (FBIL reference rates shown on
// the RBI website). Each rate is a fact with its source and date.
// CAD comes from the Bank of Canada instead: RBI/FBIL do not publish a CAD reference rate.
// Keep imports relative (used by the data check script).
export const RATES: ExchangeRate[] = [
  {
    currency: "GBP",
    value: 123.1363,
    sourceUrl: "https://www.rbi.org.in/home.aspx",
    sourceName: "FBIL reference rate (RBI website)",
    lastChecked: "2026-11-18",
    note: "As at 1:00 pm on 18 November 2026",
  },
  {
    currency: "CAD",
    // Bank of Canada gives CAD per INR (0.01529 on 2026-11-17); stored here as INR per CAD = 1 / 0.01529
    value: 65.4,
    sourceUrl: "https://www.bankofcanada.ca/valet/observations/FXINRCAD/json?recent=5",
    sourceName: "Bank of Canada daily exchange rate",
    lastChecked: "2026-11-18",
    note: "Bank of Canada rate for 17 November 2026: 1 INR = 0.01529 CAD (about ₹65.40 per CAD)",
  },
  {
    currency: "EUR",
    value: 102.1504,
    sourceUrl: "https://www.rbi.org.in/home.aspx",
    sourceName: "FBIL reference rate (RBI website)",
    lastChecked: "2026-11-20",
    note: "As at 1:00 pm on 20 November 2026 (rupees per euro, as published)",
  },
  {
    currency: "AUD",
    // Published directly as rupees per A$1, so no conversion is needed
    value: 61.98,
    sourceUrl: "https://www.rba.gov.au/statistics/frequency/exchange-rates.html",
    sourceName: "Reserve Bank of Australia exchange rates",
    lastChecked: "2026-11-20",
    note: "RBA rate for 20 November 2026: A$1 = 61.98 Indian rupees (as published)",
  },
  {
    currency: "USD",
    value: 92.9699,
    sourceUrl: "https://www.rbi.org.in/home.aspx",
    sourceName: "FBIL reference rate (RBI website)",
    lastChecked: "2026-11-21",
    note: "As at 1:00 pm on 20 November 2026 (rupees per US dollar, as published)",
  },
];
