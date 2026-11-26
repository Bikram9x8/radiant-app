// Labels for "Latest updates" items. Pure functions (server and client).
import { formatDate } from "@/lib/abroad/format";

/** Plain, serialisable shape of a VERIFIED item for the pages (internalNotes is never included) */
export type UpdateView = {
  slug: string;
  title: string;
  organisation: string;
  type: string;
  forWho: string | null;
  location: string | null;
  mode: string | null;
  dates: string | null;
  /** YYYY-MM-DD, or null when no deadline was given */
  deadline: string | null;
  oneLine: string;
  linkUrl: string;
  sourceType: string;
  /** YYYY-MM-DD */
  checked: string | null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Today's date in India as YYYY-MM-DD (deadlines are Indian dates) */
export function todayIst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/**
 * "Deadline 18 Dec" ("18 Dec 2027" in another year). With no deadline the item says to check the link:
 * an empty deadline only means none was given to us, not that it is rolling.
 */
export function deadlineLabel(deadline: string | null) {
  if (!deadline) return "Deadline: see link";
  const [y, m, d] = deadline.split("-").map(Number);
  return `Deadline ${d} ${MONTHS[m - 1]}${y === Number(todayIst().slice(0, 4)) ? "" : ` ${y}`}`;
}

/** Days left until the deadline (0 = today), or null */
export function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  return Math.round((Date.parse(deadline) - Date.parse(todayIst())) / 86400000);
}

/** "Posted by the supervisor" / "Posted by the organisation" for items that only have a post */
export function postedBy(sourceType: string) {
  if (sourceType === "Supervisor post") return "Posted by the supervisor";
  if (sourceType === "Organisation post") return "Posted by the organisation";
  return null;
}

/** Text of the item's link */
export function linkText(sourceType: string) {
  return postedBy(sourceType) ? "View post" : sourceType; // "Official page" / "Official vacancy"
}

/** "Official page · checked 25 Nov 2026" */
export function sourceLine(u: Pick<UpdateView, "sourceType" | "checked">) {
  return u.checked ? `${u.sourceType} · checked ${formatDate(u.checked)}` : u.sourceType;
}
