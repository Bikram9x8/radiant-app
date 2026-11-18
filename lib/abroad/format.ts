// Formatting for Study Abroad facts. Pure functions (server and client).
import type { Fact, Money, Range } from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-20" -> "20 Nov 2026" */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Local currency with grouping, e.g. "CAD 20,000" (rupees use Indian grouping: "₹1,20,000") */
export function formatMoney(m: Money) {
  if (m.currency === "INR") return `₹${Math.round(m.amount).toLocaleString("en-IN")}`;
  return `${m.currency} ${Math.round(m.amount).toLocaleString("en-US")}`;
}

export function formatMoneyRange(r: Range<Money>) {
  if (r.min.amount === r.max.amount) return formatMoney(r.min);
  const max = r.max.currency === "INR" ? formatMoney(r.max) : Math.round(r.max.amount).toLocaleString("en-US");
  return `${formatMoney(r.min)} to ${max}`;
}

/** Short rupees for estimates: ₹85K, ₹12.4L, ₹1.2 Cr */
export function formatInrShort(n: number) {
  if (n <= 0) return "₹0";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  return `₹${Math.round(n / 1000)}K`;
}

/** Rupee estimate of a local amount at a dated rate (rupees per unit) */
export function toInr(amount: number, rupeesPerUnit: number) {
  return amount * rupeesPerUnit;
}

/** All facts that are present (for source lists), without duplicates of the same source page */
export function uniqueSources(facts: (Fact<unknown> | undefined | null)[]) {
  const seen = new Map<string, Fact<unknown>>();
  for (const f of facts) {
    if (!f) continue;
    const prev = seen.get(f.sourceUrl);
    // Keep the oldest check date for a source, so the line never overstates freshness
    if (!prev || f.lastChecked < prev.lastChecked) seen.set(f.sourceUrl, f);
  }
  return [...seen.values()];
}
