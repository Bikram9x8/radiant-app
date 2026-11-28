import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SHOW_UPDATES } from "@/lib/features";
import { openUpdates } from "@/lib/updates/data";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import UpdateCard from "@/components/updates/UpdateCard";
import u from "@/components/updates/updates.module.css";

// Read on each request, so an item disappears the day after its deadline
export const dynamic = "force-dynamic";

const TITLE = `Latest updates: internships and PhDs | ${SITE_NAME}`;
const DESCRIPTION =
  "Open internships, PhD and MS positions, workshops, fellowships, scholarships and exam dates, each with its official link and the date we checked it.";

export const metadata: Metadata = SHOW_UPDATES
  ? {
      title: TITLE,
      description: DESCRIPTION,
      alternates: { canonical: absoluteUrl("/updates") },
      openGraph: { type: "website", url: absoluteUrl("/updates"), title: TITLE, description: DESCRIPTION, siteName: SITE_NAME, locale: "en_IN" },
    }
  : {};

type Props = { searchParams: Promise<{ type?: string | string[]; for?: string | string[] }> };

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
const options = (values: (string | null)[]) => [...new Set(values.filter((v): v is string => !!v))].sort();

// All VERIFIED items whose deadline has not passed, nearest deadline first. Filters are a plain GET form
// (they work without JavaScript); expired items never show.
export default async function UpdatesPage({ searchParams }: Props) {
  if (!SHOW_UPDATES) notFound(); // also checked in the layout; this keeps the database untouched
  const all = await openUpdates();
  const sp = await searchParams;
  const types = options(all.map((x) => x.type));
  const whos = options(all.map((x) => x.forWho));
  const type = types.includes(one(sp.type)) ? one(sp.type) : "";
  const who = whos.includes(one(sp.for)) ? one(sp.for) : "";
  const shown = all.filter((x) => (!type || x.type === type) && (!who || x.forWho === who));

  return (
    <div className={`${u.page} flex-1`}>
      <div className={`${u.wrap} ${u.phead}`}>
        <h1 className={u.h1}>
          Latest <span className={u.ser}>updates</span>
        </h1>
        <p className={u.lead}>
          Internships, PhD and MS positions, workshops, fellowships, scholarships and exam dates that are still open.
          Each one links to its official page, or to the supervisor&rsquo;s or organisation&rsquo;s own post when that
          is the only source, with the date we checked it.
        </p>
      </div>

      <div className={u.wrap}>
        <form className={u.filters} method="get" action="/updates" aria-label="Filter updates">
          <div className={u.fl}>
            <label htmlFor="f-type">Type</label>
            <select id="f-type" name="type" defaultValue={type}>
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className={u.fl}>
            <label htmlFor="f-for">For</label>
            <select id="f-for" name="for" defaultValue={who}>
              <option value="">Everyone</option>
              {whos.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={u.btn}>
            Show
          </button>
          {(type || who) && (
            <Link className={u.clear} href="/updates">
              Clear filters
            </Link>
          )}
        </form>

        <p className={u.count} aria-live="polite">
          {shown.length} open {shown.length === 1 ? "update" : "updates"}
        </p>
        <p className={u.note}>Always check the deadline and the rules on the official page before you apply.</p>

        {shown.length === 0 ? (
          <p className={u.noItems}>{all.length ? "Nothing matches these filters." : "No open updates right now. Check back soon."}</p>
        ) : (
          <ul className={u.cards}>
            {shown.map((x) => (
              <li key={x.slug}>
                <UpdateCard item={x} headingLevel={2} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
