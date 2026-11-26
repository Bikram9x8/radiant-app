import Link from "next/link";
import type { UpdateView } from "@/lib/updates/format";
import UpdateCard from "./UpdateCard";
import u from "./updates.module.css";

// Homepage (only while SHOW_UPDATES is on; app/page.tsx loads this file only then, so the homepage is
// unchanged while it is off): the first section after the hero ("Everything after Class 12") with a
// "Latest updates" panel on its right on desktop, stacked below it on phones.
export default function HomeWithUpdates({ children, items }: { children: React.ReactNode; items: UpdateView[] }) {
  return (
    <div className={u.homeGrid}>
      {children}
      <aside className={u.panel} aria-labelledby="home-updates">
        <div className={u.panelHead}>
          <h2 id="home-updates" className={u.panelTitle}>
            Latest <span className={u.ser}>updates</span>
          </h2>
          <Link className={u.all} href="/updates">
            See all<span className="sr-only"> latest updates</span> →
          </Link>
        </div>
        {items.length === 0 ? (
          <p className={u.empty}>No open updates right now. Check back soon.</p>
        ) : (
          <ul className={u.list}>
            {items.map((x) => (
              <li key={x.slug}>
                <UpdateCard item={x} compact />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
