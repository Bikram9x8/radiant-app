import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import s from "./landing.module.css";
import AdSlot from "@/components/AdSlot";
import { SHOW_SCHOOL } from "@/lib/features";
import { entranceMeta, isTestPost } from "@/lib/test-posts";

export type RecentItem = {
  id: string;
  title: string;
  type: string;
  division?: string | null;
  category: { name: string } | null;
};

// Line under the title: with School switched off, tests read as entrance prep without a class
// ("JEE / NEET prep · Physics"); otherwise the category name.
function subLine(o: RecentItem) {
  if (!SHOW_SCHOOL && isTestPost(o)) return entranceMeta(o.category?.name);
  return o.category?.name ?? "";
}

// Real data: the newest approved posts (app/page.tsx), with the 300 x 250 ad box beside them.
// hideAd (while Colleges is live, until a real ad exists): no empty ad box, the list takes the full width
// (inline style, so landing.module.css and the page while the switch is off stay unchanged).
export default function RecentlyAdded({ items, hideAd = false }: { items: RecentItem[]; hideAd?: boolean }) {
  return (
    <section className={`${s.wrap} ${s.section}`} aria-labelledby="home-recent">
      {/* style only when needed: an explicit undefined would still change the page while the switch is off */}
      <div className={s.recentGrid} {...(hideAd ? { style: { gridTemplateColumns: "minmax(0, 1fr)" } } : {})}>
        <div>
          <div className={s.recentHead}>
            <h2 id="home-recent" className={s.h2}>
              Recently <span className={s.ser}>added</span>
            </h2>
            <Link href="/search" className={s.viewAll}>
              View all →
            </Link>
          </div>

          {items.length === 0 ? (
            <p className={s.lead}>Nothing posted yet. Check back soon.</p>
          ) : (
            <ul className={`${s.sticker} ${s.recentList}`}>
              {items.map((o) => {
                const sub = subLine(o);
                return (
                  <li key={o.id}>
                    <Link href={`/opportunities/${o.id}`} className={s.recentRow}>
                      <span className="min-w-0">
                        <b>{o.title}</b>
                        {sub && <small>{sub}</small>}
                      </span>
                      <IconArrowRight size={20} aria-hidden="true" className={s.arrow} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!hideAd && <AdSlot label="300 × 250 box space" className="h-[250px] max-w-full" />}
      </div>
    </section>
  );
}
