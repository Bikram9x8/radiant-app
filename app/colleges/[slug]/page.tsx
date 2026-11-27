import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_COLLEGES } from "@/lib/features";
import { getVerifiedCollege } from "@/lib/colleges/data";
import { COURSES_SOON, feeLines, NOT_AVAILABLE, place, years } from "@/lib/colleges/format";
import type { CollegeView } from "@/lib/colleges/types";
import { factSources } from "@/lib/colleges/fact-sources";
import { formatDate } from "@/lib/abroad/format";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { breadcrumbJsonLd, collegeCrumbs, collegeJsonLd, collegePath, jsonLdHtml } from "@/lib/colleges/seo";
import SourceList from "@/components/colleges/SourceList";
import ExamNames from "@/components/colleges/ExamNames";
import s from "@/components/colleges/colleges.module.css";

// Read from the database on each request; only VERIFIED colleges have a page, every other slug is a 404
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!SHOW_COLLEGES) return {};
  const { slug } = await params;
  const c = await getVerifiedCollege(slug);
  // Draft or unknown slug: the page is a 404, so no canonical, Open Graph or indexing
  if (!c) return { title: `College not found | ${SITE_NAME}`, robots: { index: false } };
  const url = absoluteUrl(collegePath(c.slug));
  const title = `${c.name}: courses, eligibility and fees | ${SITE_NAME}`;
  const where = place(c); // "Chandigarh" once when the city is also the state
  const description = `${c.name}${where ? `, ${where}` : ""}: courses, eligibility, entrance exams and fees from official sources, with the date each was checked.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, siteName: SITE_NAME, locale: "en_IN" },
  };
}

/** A key-facts row: the value, or "Not available yet" */
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div>
      <dt>{label}</dt>
      <dd className={empty ? s.na : undefined}>{empty ? NOT_AVAILABLE : value}</dd>
    </div>
  );
}

function Heading({ title, accent, coral }: { title: string; accent?: string; coral?: boolean }) {
  return (
    <h2 className={s.h2}>
      {title} {accent && <span className={`${s.ser} ${coral ? s.serC : ""}`}>{accent}</span>}
    </h2>
  );
}

// The college name with its last word in the serif accent, like the design
function Title({ name }: { name: string }) {
  const i = name.lastIndexOf(" ");
  if (i < 1) return <>{name}</>;
  return (
    <>
      {name.slice(0, i)} <span className={s.serLight}>{name.slice(i + 1)}</span>
    </>
  );
}

function hasContact(c: CollegeView) {
  return !!(c.admissionPhone || c.admissionEmail || c.fullAddress || c.officialWebsite);
}

// College page (radiant-design/college-pages.html, "college" view): header, key facts, courses and
// fees, contact. Each block lists the sources of the facts it shows. Empty facts say "Not available
// yet"; a block with no data at all is left out. Fees are shown exactly as stored, never worked out.
export default async function CollegePage({ params }: Props) {
  if (!SHOW_COLLEGES) notFound();
  const { slug } = await params;
  const c = await getVerifiedCollege(slug);
  if (!c) notFound();

  const meta = [place(c), c.type, c.establishedYear ? `Established ${c.establishedYear}` : null].filter(Boolean);
  // District logic unchanged; the state is left out when it is the city itself (Chandigarh)
  const location = [
    c.city,
    c.district && c.district !== c.city ? `${c.district} district` : null,
    c.state && c.state !== c.city ? c.state : null,
  ]
    .filter(Boolean)
    .join(", ");
  const crumbs = collegeCrumbs(c);

  return (
    <div className={`${s.page} flex-1`}>
      {/* JSON-LD for search engines: verified, sourced facts only (lib/colleges/seo.ts) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(collegeJsonLd(c))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumbJsonLd(crumbs))} />
      {/* Header */}
      <div className={s.cband}>
        <div className={`${s.wrap} ${s.cbandIn}`}>
          <nav aria-label="Breadcrumb" className={s.crumb}>
            {crumbs.map((x, i) =>
              i < crumbs.length - 1 ? (
                <span key={x.path}>
                  <Link href={x.path}>{x.name}</Link> /{" "}
                </span>
              ) : (
                <span key={x.path} aria-current="page">
                  {x.name}
                </span>
              ),
            )}
          </nav>
          <h1 className={s.ch1}>
            <Title name={c.name} />
          </h1>
          {meta.length > 0 && <p className={s.cmeta}>{meta.join(" · ")}</p>}
          {(c.naacGrade || c.approvedBy.length > 0) && (
            <div className={s.tags}>
              {c.naacGrade && <span className={`${s.chip} ${s.chipBandC}`}>NAAC {c.naacGrade}</span>}
              {c.approvedBy.map((a) => (
                <span key={a} className={`${s.chip} ${s.chipBand}`}>
                  {a} approved
                </span>
              ))}
            </div>
          )}
          <div className={s.cact}>
            {c.officialWebsite && (
              <a className={`${s.btn} ${s.btnPri}`} href={c.officialWebsite} target="_blank" rel="noopener noreferrer">
                Official website<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {/* Opens the college list with this college already picked to compare */}
            <Link className={`${s.btn} ${s.btnOutDark}`} href={`/colleges?compare=${c.slug}`}>
              Add to compare
            </Link>
          </div>
          <SourceList
            dark
            college={c}
            items={factSources(c, ["type", "year", "approval", "naac", "location"])}
          />
        </div>
      </div>

      <div className={`${s.wrap} ${s.cgrid}`}>
        <div>
          {/* Key facts */}
          <section className={`${s.card} ${s.sec}`} aria-labelledby="kf">
            <div id="kf">
              <Heading title="Key" accent="facts" />
            </div>
            <dl className={s.qf}>
              <Fact label="Type" value={c.type} />
              <Fact label="Established" value={c.establishedYear} />
              <Fact label="Approved by" value={c.approvedBy.join(", ")} />
              <Fact
                label="NAAC grade"
                value={c.naacGrade && `${c.naacGrade}${c.naacValidUntil ? ` (valid until ${formatDate(c.naacValidUntil)})` : ""}`}
              />
              <Fact
                label="NIRF rank"
                value={
                  c.nirfRank &&
                  `${c.nirfRank}${c.nirfCategory || c.nirfYear ? ` (${[c.nirfCategory, c.nirfYear].filter(Boolean).join(", ")})` : ""}`
                }
              />
              <Fact label="Campus" value={c.campusAreaAcres && `${c.campusAreaAcres.toLocaleString("en-IN")} acres`} />
              <Fact label="Hostel" value={c.hostel} />
              <Fact label="Location" value={location} />
            </dl>
            <SourceList
              college={c}
              items={factSources(c, ["type", "year", "district", "approval", "naac", "nirf", "location", "campus", "hostel"])}
            />
          </section>

          {/* Courses and fees (no verified course yet: one muted line instead of an empty section) */}
          {c.courses.length === 0 && (
            <section className={`${s.card} ${s.sec}`} aria-labelledby="cf">
              <div id="cf">
                <Heading title="Courses" accent="and fees" coral />
              </div>
              <p className={s.soon}>{COURSES_SOON}</p>
            </section>
          )}
          {c.courses.length > 0 && (
            <section className={`${s.card} ${s.sec}`} aria-labelledby="cf">
              <div id="cf">
                <Heading title="Courses" accent="and fees" coral />
              </div>
              <div className={s.ctabWrap}>
                <table className={s.ctab}>
                  <thead>
                    <tr>
                      <th scope="col">Course</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Eligibility</th>
                      <th scope="col">Entrance exams</th>
                      <th scope="col">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.courses.map((k) => {
                      const fees = feeLines(k);
                      const sub = [k.specialization, k.level, k.stream, k.mode].filter(Boolean).join(" · ");
                      return (
                        <tr key={k.courseId}>
                          <th scope="row" data-l="Course">
                            <b>{k.name}</b>
                            {sub && <small>{sub}</small>}
                          </th>
                          <td data-l="Duration" className={k.durationYears ? undefined : s.na}>
                            {k.durationYears ? years(k.durationYears) : NOT_AVAILABLE}
                          </td>
                          <td data-l="Eligibility" className={k.eligibility ? undefined : s.na}>
                            {k.eligibility ?? NOT_AVAILABLE}
                          </td>
                          <td data-l="Entrance exams" className={k.entranceExams.length ? undefined : s.na}>
                            {k.entranceExams.length ? <ExamNames exams={k.entranceExams} /> : NOT_AVAILABLE}
                          </td>
                          <td data-l="Fee" className={fees.length ? s.fee : s.na}>
                            {fees.length
                              ? fees.map((x) => (
                                  <span key={x.label} className={s.feeLine}>
                                    <b>{x.amount}</b>
                                    <small>
                                      {x.label}
                                      {k.feeYear ? `, ${k.feeYear}` : ""}
                                    </small>
                                  </span>
                                ))
                              : NOT_AVAILABLE}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className={s.note}>
                Fees are shown exactly as the college publishes them, for the year shown. Hostel is charged
                separately. Check the official fee page for what is included before you pay.
              </p>
              <SourceList
                college={c}
                items={c.courses.flatMap((k) => [
                  { label: "Course details", src: k.src.course },
                  { label: "Fees", src: feeLines(k).length ? k.src.fee : null },
                  { label: "Eligibility", src: k.eligibility ? k.src.eligibility : null },
                  { label: "Entrance exams", src: k.entranceExams.length ? k.src.exams : null },
                ])}
              />
            </section>
          )}
        </div>

        {/* Contact */}
        {hasContact(c) && (
          <aside className={s.side} aria-labelledby="ct">
            <div className={`${s.card} ${s.sideCard}`}>
              <h2 id="ct" className={s.sideTitle}>
                Admissions contact
              </h2>
              <dl className={s.contact}>
                {c.admissionPhone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${c.admissionPhone.replace(/[^\d+]/g, "")}`}>{c.admissionPhone}</a>
                    </dd>
                  </div>
                )}
                {c.admissionEmail && (
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${c.admissionEmail}`}>{c.admissionEmail}</a>
                    </dd>
                  </div>
                )}
                {c.fullAddress && (
                  <div>
                    <dt>Address</dt>
                    <dd>{c.fullAddress}</dd>
                  </div>
                )}
              </dl>
              {c.officialWebsite && (
                <a className={`${s.btn} ${s.btnDark} ${s.full}`} href={c.officialWebsite} target="_blank" rel="noopener noreferrer">
                  Visit official website<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              <SourceList
                college={c}
                items={factSources(c, ["phone", "email", "address", "website"])}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
