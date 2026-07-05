"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  APPLIED: "text-blue-600",
  SHORTLISTED: "text-amber-600",
  REJECTED: "text-red-600",
  SELECTED: "text-green-600",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
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
    <div className="max-w-3xl mx-auto mt-12 px-6 mb-12">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      {loading && <p className="text-zinc-500">Loading...</p>}

      {!loading && applications.length === 0 && (
        <p className="text-zinc-500">
          You haven't applied to anything yet.{" "}
          <Link href="/opportunities" className="text-blue-700 font-semibold">
            Browse opportunities
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-4">
        {applications.map((app) => (
          <div key={app.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/opportunities/${app.opportunity.id}`} className="font-semibold hover:underline">
                  {app.opportunity.title}
                </Link>
                <p className="text-sm text-zinc-500">{app.opportunity.company?.companyName}</p>
              </div>
              <span className={`text-xs font-bold ${STATUS_COLORS[app.status] || ""}`}>
                {app.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Applied on {new Date(app.appliedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
