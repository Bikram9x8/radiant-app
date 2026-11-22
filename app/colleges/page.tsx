import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOW_COLLEGES } from "@/lib/features";
import { verifiedColleges } from "@/lib/colleges/data";
import { absoluteUrl } from "@/lib/site";
import CollegeFinder from "@/components/colleges/CollegeFinder";
import s from "@/components/colleges/colleges.module.css";

// Read from the database on each request (like /higher), so a newly verified college shows at once
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Colleges | Radiant Educations",
  description: "Colleges with courses, eligibility, entrance exams and fees, every fact from an official source with the date it was checked.",
  alternates: { canonical: absoluteUrl("/colleges") },
};

// College list (radiant-design/college-pages.html, "finder" view): VERIFIED colleges only,
// filtered by state, type, stream and level in the browser.
export default async function CollegesPage() {
  if (!SHOW_COLLEGES) notFound(); // also checked in the layout; this keeps the database untouched
  const colleges = await verifiedColleges();

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
      </div>
      <CollegeFinder colleges={colleges} />
    </div>
  );
}
