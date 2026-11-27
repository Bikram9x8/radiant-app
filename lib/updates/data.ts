// Reads VERIFIED "Latest updates" items whose deadline is today or later (or not given). Server only.
// Draft and expired items never leave this file; internalNotes is omitted in the query itself.
import { prisma } from "@/lib/prisma";
import { todayIst, type UpdateView } from "./format";

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

function where() {
  const today = new Date(`${todayIst()}T00:00:00.000Z`); // deadline is a DATE column
  return { status: "VERIFIED" as const, OR: [{ deadline: null }, { deadline: { gte: today } }] };
}

type Row = Awaited<ReturnType<typeof prisma.latestUpdate.findMany>>[number];
const toView = (u: Omit<Row, "internalNotes">): UpdateView => ({
  slug: u.slug,
  title: u.title,
  organisation: u.organisation,
  type: u.type,
  forWho: u.forWho,
  location: u.location,
  mode: u.mode,
  dates: u.dates,
  deadline: iso(u.deadline),
  oneLine: u.oneLine,
  linkUrl: u.linkUrl,
  sourceType: u.sourceType,
  checked: iso(u.checkedAt),
});

/** /updates: every visible item. Items with a deadline first, nearest deadline first; then items
 *  without a deadline, newest verified first */
export async function openUpdates(): Promise<UpdateView[]> {
  const rows = await prisma.latestUpdate.findMany({
    where: where(),
    omit: { internalNotes: true },
    orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { verifiedAt: "desc" }],
  });
  return rows.map(toView);
}

/** Homepage panel: the first `take` items in the same order as /updates, and how many are open in all */
export async function latestUpdates(take = 4): Promise<{ items: UpdateView[]; total: number }> {
  const all = await openUpdates();
  return { items: all.slice(0, take), total: all.length };
}
