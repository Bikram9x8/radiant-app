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

/** Homepage panel: the most recently verified items, newest first */
export async function latestUpdates(take = 6): Promise<UpdateView[]> {
  const rows = await prisma.latestUpdate.findMany({ where: where(), omit: { internalNotes: true }, orderBy: { verifiedAt: "desc" }, take });
  return rows.map(toView);
}

/** /updates: every visible item, nearest deadline first (no deadline last) */
export async function openUpdates(): Promise<UpdateView[]> {
  const rows = await prisma.latestUpdate.findMany({
    where: where(),
    omit: { internalNotes: true },
    orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { verifiedAt: "desc" }],
  });
  return rows.map(toView);
}
