import s from "@/components/school/school.module.css";

// Loading screen for /school, /courses/... and /higher. Cream like those pages, so there is no
// white flash before they appear. The shimmer blocks use the shared .skeleton class.
export default function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className={`${s.page} flex-1`}>
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-4 w-48 max-w-full" />
        <div className="skeleton mt-5 h-11 w-72 max-w-full" />
        <div className="skeleton mt-3 h-4 w-80 max-w-full" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="skeleton h-44 rounded-[24px]!" />
          ))}
        </div>
      </div>
    </div>
  );
}
