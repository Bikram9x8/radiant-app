import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="glass rounded-[18px] px-10 py-14 max-w-md">
        <h1 className="font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl">Coming <span className="font-serif font-normal normal-case italic text-teal">soon</span></h1>
        <p className="text-muted mt-2">
          This feature is on the way. Check back soon!
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-teal px-6 font-bold text-white shadow-[0_8px_20px_-10px_rgb(15_118_110/0.6)] transition-colors hover:bg-teal-dark"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}