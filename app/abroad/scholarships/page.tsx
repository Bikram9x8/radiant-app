import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import Link from "next/link";
import { verifiedCountries, verifiedScholarships } from "@/lib/abroad";
import { PLANNED_COUNTRIES } from "@/lib/abroad/planned";
import ScholarshipList from "@/components/abroad/ScholarshipList";
import s from "@/components/abroad/abroad.module.css";

export const metadata: Metadata = {
  title: "Scholarships abroad | Radiant Educations",
  alternates: { canonical: absoluteUrl("/abroad/scholarships") },
  description: "Fully funded and partial scholarships for Indian students, each linked to its official page.",
};

// Names for country slugs used by scholarships (verified guides first, then planned names)
function countryName(slug: string) {
  return (
    verifiedCountries().find((c) => c.slug === slug)?.name ??
    PLANNED_COUNTRIES.find((c) => c.slug === slug)?.name ??
    (slug === "europe" ? "Europe (several countries)" : slug.replace(/(^|-)\w/g, (m) => m.replace("-", " ").toUpperCase()))
  );
}

// Scholarships abroad (radiant-design/study-abroad.html, "scholarships" view). Only verified
// scholarships; what each covers and its deadline are facts with sources, and every card links
// the official page. Reachable only when SHOW_ABROAD is on (../layout.tsx).
export default function AbroadScholarshipsPage() {
  const items = verifiedScholarships();
  const countrySlugs = [...new Set(items.flatMap((it) => it.countries))];
  const countries = countrySlugs
    .map((slug) => ({ slug, name: countryName(slug) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={`${s.page} flex-1`}>
      <div className={`${s.wrap} ${s.phead}`}>
        <p className={s.crumbLight}>
          <Link href="/abroad">Study abroad</Link> / Scholarships
        </p>
        <h1 className={`${s.h1} ${s.h1Page}`}>
          Scholarships <span className={s.ser}>abroad</span>
        </h1>
        <p className={s.lead}>
          Fully funded and partial scholarships for Indian students. Each one links its official page, and what it
          covers and its deadline show the source and the date we checked.
        </p>
      </div>
      <div className={`${s.wrap} ${s.secLast}`}>
        {items.length > 0 ? (
          <ScholarshipList items={items} countries={countries} />
        ) : (
          <div className={s.soonCard}>
            <p>Scholarship summaries are being prepared from the official pages.</p>
            <span className={s.soonTag}>Coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}
