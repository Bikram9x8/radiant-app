import Link from "next/link";
import { getExam, verifiedCountries } from "@/lib/abroad";
import { MiniCountryCard } from "@/components/abroad/CountryCard";
import s from "./landing.module.css";

// "Study abroad" band on the homepage (rendered only when SHOW_ABROAD is on, see app/page.tsx).
// Only verified countries get a card, each with two verified facts and their source lines.
export default function AbroadBand() {
  const countries = verifiedCountries();
  const ielts = getExam("ielts");

  return (
    <section className={`${s.wrap} ${s.section} ${s.abroadHome}`} aria-labelledby="home-abroad">
      <h2 id="home-abroad" className={s.h2}>
        Study <span className={s.ser}>abroad</span>
      </h2>
      <p className={s.lead}>Country guides, visa money, work rights and scholarships, each with its official source.</p>

      {countries.length > 0 && (
        <ul className={s.abroadCards}>
          {countries.map((c) => (
            <MiniCountryCard key={c.slug} country={c} />
          ))}
        </ul>
      )}

      <nav aria-label="More on study abroad" className={s.abroadLinks}>
        {ielts && <Link href="/abroad/exams/ielts">IELTS guide</Link>}
        <Link href="/abroad/scholarships">Scholarships abroad</Link>
        <Link href="/abroad">All countries →</Link>
      </nav>
    </section>
  );
}
