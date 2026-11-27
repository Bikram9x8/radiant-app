// Site search beyond posts (read-only, server only): VERIFIED colleges and their VERIFIED courses, the
// entrance exams that have a page, and open Latest updates. Everything comes from the same loaders the
// pages use, so drafts never appear and internalNotes is never read (it is omitted in those queries).
// Colleges and exams are searched only while SHOW_COLLEGES is on, updates only while SHOW_UPDATES is on
// (their pages are 404 otherwise). Matching: every word of the search must appear (any case).
import { SHOW_COLLEGES, SHOW_UPDATES } from "@/lib/features";
import type { UpdateView } from "@/lib/updates/format";

export type CollegeHit = {
  slug: string;
  name: string;
  place: string;
  /** Verified courses whose name matches, shown under the college */
  courses: string[];
};
export type ExamHit = { slug: string; name: string; colleges: number };
export type UpdateHit = Pick<UpdateView, "slug" | "title" | "organisation" | "type" | "deadline">;

export type SearchGroups = { colleges: CollegeHit[]; exams: ExamHit[]; updates: UpdateHit[] };

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);
const hasAll = (text: string, ws: string[]) => {
  const t = text.toLowerCase();
  return ws.every((w) => t.includes(w));
};
const hasAny = (text: string, ws: string[]) => {
  const t = text.toLowerCase();
  return ws.some((w) => t.includes(w));
};

export async function searchSite(q: string): Promise<SearchGroups> {
  const ws = words(q);
  const empty: SearchGroups = { colleges: [], exams: [], updates: [] };
  if (ws.length === 0) return empty;

  let colleges: CollegeHit[] = [];
  let exams: ExamHit[] = [];
  if (SHOW_COLLEGES) {
    const { verifiedColleges } = await import("@/lib/colleges/data");
    const { collegesForExam, examsInUse } = await import("@/lib/colleges/exams");
    const { place } = await import("@/lib/colleges/format");
    const list = await verifiedColleges();

    // A college matches on its name, short name, city or state; a course on its name together with
    // the college's name ("mba chitkara"), but only when the course name itself has one of the words
    // (otherwise "chandigarh" would list every course of Chandigarh University)
    colleges = list
      .map((c) => {
        const own = [c.name, c.shortName, c.city, c.state].filter(Boolean).join(" ");
        const courses = c.courses
          .filter((k) => hasAll(`${k.name} ${c.name}`, ws) && hasAny(k.name, ws))
          .map((k) => k.name);
        return { hit: hasAll(own, ws) || courses.length > 0, value: { slug: c.slug, name: c.name, place: place(c), courses } };
      })
      .filter((x) => x.hit)
      .map((x) => x.value);

    // Exams with a page: by name or slug ("jee" finds JEE Main)
    exams = examsInUse(list)
      .filter((e) => hasAll(`${e.name} ${e.slug.replace(/-/g, " ")}`, ws))
      .map((e) => ({ ...e, colleges: collegesForExam(list, e.slug)?.list.length ?? 0 }));
  }

  let updates: UpdateHit[] = [];
  if (SHOW_UPDATES) {
    const { openUpdates } = await import("@/lib/updates/data");
    updates = (await openUpdates())
      .filter((u) => hasAll(`${u.title} ${u.organisation} ${u.oneLine}`, ws))
      .map(({ slug, title, organisation, type, deadline }) => ({ slug, title, organisation, type, deadline }));
  }

  return { colleges, exams, updates };
}
