"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";

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
      <div className="glass rounded-[18px] p-10 text-center text-muted">
        Nothing pending. All caught up.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {companies.map((c, i) => (
        <FadeIn key={c.id} delay={i * 60}>
        <div className="glass glass-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-ink">
                {c.companyProfile?.companyName || "(no name set)"}
              </h3>
              <p className="text-sm text-muted mt-1">{c.email}</p>
              {c.companyProfile?.industry && (
                <p className="text-sm mt-2 text-ink-2">
                  <span className="text-muted">Industry:</span> {c.companyProfile.industry}
                </p>
              )}
              {c.companyProfile?.website && (
                
                <a
                  href={c.companyProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-dark hover:underline mt-1 inline-block"
                >
                  {c.companyProfile.website}
                </a>
              )}
              {c.companyProfile?.description && (
                <p className="text-sm mt-2 text-muted">
                  {c.companyProfile.description}
                </p>
              )}
              {(c.companyProfile?.contactPerson || c.companyProfile?.contactPhone) && (
                <p className="text-xs text-muted mt-2">
                  Contact: {c.companyProfile?.contactPerson || "—"}
                  {c.companyProfile?.contactPhone ? ` · ${c.companyProfile.contactPhone}` : ""}
                </p>
              )}
              <p className="text-xs text-muted mt-2">
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
                className="text-sm px-4 py-2 rounded-xl glass font-semibold text-ink disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
        </FadeIn>
      ))}
    </div>
  );
}