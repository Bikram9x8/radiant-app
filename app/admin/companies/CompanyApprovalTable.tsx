"use client";

import { useState } from "react";

type CompanyUser = {
  id: string;
  email: string;
  createdAt: string | Date;
  companyProfile: {
    companyName: string;
    website: string | null;
    industry: string | null;
    description: string | null;
    contactPerson: string | null;
    contactPhone: string | null;
  } | null;
};

export default function CompanyApprovalTable({
  companies: initial,
}: {
  companies: CompanyUser[];
}) {
  const [companies, setCompanies] = useState(initial);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  }

  if (companies.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-zinc-600 dark:text-zinc-400">
        Nothing pending. All caught up.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {companies.map((c) => (
        <div key={c.id} className="glass rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {c.companyProfile?.companyName || "(no name set)"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{c.email}</p>
              {c.companyProfile?.industry && (
                <p className="text-sm mt-2 text-zinc-700 dark:text-zinc-300">
                  <span className="text-zinc-600 dark:text-zinc-400">Industry:</span> {c.companyProfile.industry}
                </p>
              )}
              {c.companyProfile?.website && (
                
                <a
                  href={c.companyProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
                >
                  {c.companyProfile.website}
                </a>
              )}
              {c.companyProfile?.description && (
                <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-400">
                  {c.companyProfile.description}
                </p>
              )}
              {(c.companyProfile?.contactPerson || c.companyProfile?.contactPhone) && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                  Contact: {c.companyProfile?.contactPerson || "—"}
                  {c.companyProfile?.contactPhone ? ` · ${c.companyProfile.contactPhone}` : ""}
                </p>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                Signed up: {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                disabled={updatingId === c.id}
                onClick={() => updateStatus(c.id, "APPROVED")}
                className="text-sm px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={updatingId === c.id}
                onClick={() => updateStatus(c.id, "REJECTED")}
                className="text-sm px-4 py-2 rounded-xl glass font-semibold text-zinc-900 dark:text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
