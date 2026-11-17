import Link from "next/link";
import { primaryButton } from "@/components/mcq/ui";

// Shown with status 404 when a test doesn't exist, isn't published or has no questions
// (app/tests/[id]/page.tsx calls notFound()).
export default function TestNotAvailable() {
  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="card p-6 sm:p-8">
        <h1 className="font-display text-[34px] leading-[0.95] font-extrabold uppercase text-ink sm:text-[40px]">
          This test isn&apos;t{" "}
          <span className="font-serif font-normal normal-case italic text-teal">available</span>
        </h1>
        <p className="mt-3 text-muted">It may have been taken down or moved. Find other practice tests below.</p>
        <Link href="/opportunities" className={`${primaryButton} mt-5`}>
          Browse tests
        </Link>
      </div>
    </div>
  );
}
