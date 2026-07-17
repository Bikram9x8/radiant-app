"use client";

import { useState } from "react";

type Application = {
  id: string;
  status: string;
  appliedAt: string | Date;
  coverNote: string | null;
  resumeUrl: string | null;
  student: {
    fullName: string;
    phone: string | null;
    college: string | null;
    user: { email: string };
  };
};

const statusStyles: Record<string, string> = {
  APPLIED: "bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300",
  SHORTLISTED: "bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  SELECTED: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
  REJECTED: "bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300",
};

export default function ApplicantsTable({
  applications: initialApplications,
}: {
  applications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    }
  }

  function exportCsv() {
    const headers = ["Name", "Email", "Phone", "College", "Status", "Applied At"];
    const rows = applications.map((a) => [
      a.student.fullName,
      a.student.user.email,
      a.student.phone || "",
      a.student.college || "",
      a.status,
      new Date(a.appliedAt).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applicants.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (applications.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center text-zinc-600 dark:text-zinc-400">
        No applicants yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={exportCsv}
          className="rounded-xl px-4 py-2 glass font-semibold text-sm text-zinc-900 dark:text-white"
        >
          Export CSV
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 dark:border-white/10">
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">College</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:divide-white/5">
            {applications.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{a.student.fullName}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  <div>{a.student.user.email}</div>
                  {a.student.phone && <div className="text-xs">{a.student.phone}</div>}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {a.student.college || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      disabled={updatingId === a.id}
                      onClick={() => updateStatus(a.id, "SHORTLISTED")}
                      className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                    <button
                      disabled={updatingId === a.id}
                      onClick={() => updateStatus(a.id, "SELECTED")}
                      className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white disabled:opacity-50"
                    >
                      Select
                    </button>
                    <button
                      disabled={updatingId === a.id}
                      onClick={() => updateStatus(a.id, "REJECTED")}
                      className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
