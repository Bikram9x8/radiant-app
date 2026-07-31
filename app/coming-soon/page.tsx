import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="glass rounded-3xl px-10 py-14 max-w-md">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Coming Soon</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          This feature is on the way. Check back soon!
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 rounded-xl px-5 py-2.5 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}