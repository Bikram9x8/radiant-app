export default function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8" aria-busy="true" aria-label="Loading">
        <div className="skeleton h-4 w-48 max-w-full" />
        <div className="skeleton h-10 w-64 max-w-full mt-5" />
        <div className="skeleton h-4 w-80 max-w-full mt-3" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="skeleton h-44" />
          ))}
        </div>
      </div>
    </div>
  );
}
