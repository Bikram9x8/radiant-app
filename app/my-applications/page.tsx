"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Status pills (Phase 2 palette)
const STATUS_COLORS: Record<string, string> = {
  APPLIED: "bg-(--tint-aqua) text-(--teal-dark)",
  SHORTLISTED: "bg-(--tint-sand) text-[#92400e]",
  REJECTED: "bg-red-50 text-red-700",
  SELECTED: "bg-(--tint-teal) text-(--teal-dark)",
};

// The fields this page reads from /api/my-applications (JSON: dates arrive as strings)
type MyApplication = {
  id: string;
  status: string;
  appliedAt: string;
  opportunity: { id: string; title: string; company?: { companyName: string } | null };
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/my-applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 mb-12 w-full">
      <h1 className="mb-6 font-display text-[40px] leading-[0.95] font-extrabold uppercase text-(--ink) sm:text-5xl">
        My <span className="font-serif font-normal normal-case italic text-(--teal)">applications</span>
      </h1>

      {loading && <p className="text-(--muted)">Loading...</p>}

      {!loading && applications.length === 0 && (
        <p className="text-(--muted)">
          You haven&apos;t applied to anything yet.{" "}
          <Link href="/opportunities" className="font-bold text-(--teal-dark) underline-offset-4 hover:underline">
            Browse opportunities
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {applications.map((app) => (
          <div key={app.id} className="rounded-[18px] border border-(--line) bg-white p-5 shadow-soft">
            <div className="flex justify-between items-start gap-4">
              <div>
                <Link href={`/opportunities/${app.opportunity.id}`} className="font-bold text-(--ink) underline-offset-4 hover:text-(--teal-dark) hover:underline">
                  {app.opportunity.title}
                </Link>
                <p className="text-sm text-(--muted)">{app.opportunity.company?.companyName}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[app.status] || "bg-[#f1f5f9] text-(--ink-2)"}`}>
                {app.status}
              </span>
            </div>
            <p className="text-xs text-(--muted) mt-2">
              Applied on {new Date(app.appliedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
