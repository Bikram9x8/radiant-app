import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOW_COLLEGES } from "@/lib/features";
import { verifiedColleges } from "@/lib/colleges/data";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { examPath, examsInUse } from "@/lib/colleges/exams";
import { parseCompare } from "@/lib/colleges/compare";
import Link from "next/link";
import CollegeFinder from "@/components/colleges/CollegeFinder";
import s from "@/components/colleges/colleges.module.css";

// Read from the database on each request (like /higher), so a newly verified college shows at once
export const dynamic = "force-dynamic";

const TITLE = `Colleges | ${SITE_NAME}`;
const DESCRIPTION =
  "Colleges with courses, eligibility, entrance exams and fees, every fact from an official source with the date it was checked.";

// While the switch is off the page is a 404, so it gets no canonical or Open Graph
export const metadata: Metadata = SHOW_COLLEGES
  ? {
      title: TITLE,
      description: DESCRIPTION,
      alternates: { canonical: absoluteUrl("/colleges") },
      openGraph: { type: "website", url: absoluteUrl("/colleges"), title: TITLE, description: DESCRIPTION, siteName: SITE_NAME, locale: "en_IN" },
    }
  : {};

type Props = { searchParams: Promise<{ state?: string | string[]; compare?: string | string[] }> };

// College list (radiant-design/college-pages.html, "finder" view): VERIFIED colleges only,
// filtered by state, type, stream and level in the browser.
export default async function CollegesPage({ searchParams }: Props) {
  if (!SHOW_COLLEGES) notFound(); // also checked in the layout; this keeps the database untouched
  const colleges = await verifiedColleges();
  // ?state= (from the college page breadcrumb) preselects that state, if a verified college has it
  const sp = await searchParams;
  const q = sp.state;
  const state = typeof q === "string" && colleges.some((c) => c.state === q) ? q : "";
  // ?compare= (picked on this page, or "Add to compare" on a college page): verified colleges only
  const compare = parseCompare(sp.compare).filter((slug) => colleges.some((c) => c.slug === slug));
  const exams = examsInUse(colleges);

  return (
    <div className={`${s.page} flex-1`}>
      <div className={`${s.wrap} ${s.phead}`}>
        <h1 className={s.h1}>
          Colleges <span className={s.ser}>checked at the source</span>
        </h1>
        <p className={s.lead}>
          Courses, eligibility, entrance exams and fees for each college, taken from official pages only. Every fact
          shows where it comes from and when we checked it. Anything we could not confirm says &ldquo;Not available
          yet&rdquo;.
        </p>
        {exams.length > 0 && (
          <nav aria-label="By entrance exam" className={s.examRow}>
            <span>By entrance exam:</span>
            {exams.map((e) => (
              <Link key={e.slug} className={`${s.chip} ${s.chipLink}`} href={examPath(e.slug)}>
                {e.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <CollegeFinder colleges={colleges} initialState={state} initialCompare={compare} />
    </div>
  );
}
