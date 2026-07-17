"use client";

import { useState } from "react";

type Opportunity = {
  id: string;
  title: string;
  type: string;
  description: string;
  externalLink: string | null;
  applyDeadline: string | Date;
  createdAt: string | Date;
  company: { companyName: string };
  category: { name: string };
};

export default function ApprovalTable({
  opportunities: initial,
}: {
  opportunities: Opportunity[];
}) {
  const [opportunities, setOpportunities] = useState(initial);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED", reason?: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason: reason }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setRejectingId(null);
      setRejectionReason("");
    }
  }

  if (opportunities.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-zinc-600 dark:text-zinc-400">
        Nothing pending. All caught up.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {opportunities.map((o) => (
        <div key={o.id} className="glass rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-zinc-900 dark:text-white">{o.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                  {o.type}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {o.company.companyName} · {o.category.name}
              </p>
              <p className="text-sm mt-3 text-zinc-700 dark:text-zinc-300">{o.description}</p>
              {o.externalLink && (
                <a
                  href={o.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2 inline-block"
                >
                  {o.externalLink}
                </a>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                Deadline: {new Date(o.applyDeadline).toLocaleDateString()} · Submitted:{" "}
                {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <button
                disabled={updatingId === o.id}
                onClick={() => updateStatus(o.id, "APPROVED")}
                className="text-sm px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={updatingId === o.id}
                onClick={() => setRejectingId(rejectingId === o.id ? null : o.id)}
                className="text-sm px-4 py-2 rounded-xl glass font-semibold text-zinc-900 dark:text-white disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>

          {rejectingId === o.id && (
            <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10 flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white">Rejection reason (optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                placeholder="e.g. Test link is broken"
              />
              <div className="flex gap-2">
                <button
                  disabled={updatingId === o.id}
                  onClick={() => updateStatus(o.id, "REJECTED", rejectionReason)}
                  className="text-sm px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setRejectingId(null)}
                  className="text-sm px-4 py-2 rounded-xl glass font-semibold text-zinc-900 dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}