import type { ExchangeRate } from "./types";

// Rupees per unit of each currency, for converting fees to rupees (e.g. RBI reference rates).
// Each rate is a fact with its source and date. Empty until Part 8.
// Keep imports relative (used by the data check script).
export const RATES: ExchangeRate[] = [];
