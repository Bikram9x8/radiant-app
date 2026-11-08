import Link from "next/link";
import s from "./home.module.css";
import Reveal from "./Reveal";
import AdSlot from "./AdSlot";

export type RecentItem = {
  id: string;
  title: string;
  category: { name: string } | null;
};

export default function RecentlyAdded({ items }: { items: RecentItem[] }) {
  return (
    <Reveal aria-labelledby="home-recent" className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-8 md:pb-[72px]">
      <div className="flex flex-wrap items-start gap-8">
        <div className="min-w-0 flex-1 basis-[300px] sm:basis-[460px]">
          <div className="flex items-center justify-between gap-4">
            <h2 id="home-recent" className={`${s.display} m-0 text-[28px] leading-tight font-bold md:text-[40px]`}>
              Recently added
            </h2>
            <Link
              href="/opportunities"
              className="inline-flex min-h-11 items-center px-1 text-[15px] font-extrabold text-(--hp-link) underline-offset-4 hover:underline"
            >
              View all →
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="mt-5 text-base font-semibold text-(--hp-muted)">Nothing posted yet. Check back soon.</p>
          ) : (
            <ul className="m-0 mt-5 list-none overflow-hidden rounded-[28px] border-[3px] border-(--hp-ink) bg-white p-0 shadow-[6px_6px_0_var(--hp-ink)]">
              {items.map((o, i) => (
                <li key={o.id} className={i > 0 ? "border-t-2 border-(--hp-line)" : ""}>
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="flex min-h-11 flex-col justify-center px-5 py-4 text-(--hp-ink) no-underline hover:bg-(--hp-butter)"
                  >
                    <span className="text-[17px] font-extrabold">{o.title}</span>
                    {o.category?.name && (
                      <span className="mt-0.5 text-sm font-semibold text-(--hp-muted)">{o.category.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full shrink-0 sm:w-[300px]">
          <AdSlot label="300 × 250 box space" className="h-[250px] max-w-full" />
        </div>
      </div>
    </Reveal>
  );
}
