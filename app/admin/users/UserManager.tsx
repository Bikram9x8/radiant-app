"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";

type UserRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string | Date;
  studentProfile: { fullName: string } | null;
  companyProfile: { companyName: string } | null;
};

const statusStyles: Record<string, string> = {
  APPROVED: "bg-emerald-100/80 text-emerald-800",
  PENDING: "bg-amber-100/80 text-amber-800",
  BLOCKED: "bg-red-100/80 text-red-800",
  REJECTED: "bg-zinc-200/80 text-muted",
};

export default function UserManager({
  users: initial,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initial);
  const [filter, setFilter] = useState<"ALL" | "STUDENT" | "COMPANY" | "ADMIN">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleBlock(id: string, currentStatus: string) {
    setError(null);
    setUpdatingId(id);
    const newStatus = currentStatus === "BLOCKED" ? "APPROVED" : "BLOCKED";

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingId(null);

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
    }
  }

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);

  function displayName(u: UserRow) {
    return u.studentProfile?.fullName || u.companyProfile?.companyName || "—";
  }

  return (
    <FadeIn>
    <div>
      <div className="flex gap-2 mb-4">
        {(["ALL", "STUDENT", "COMPANY", "ADMIN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-xl ${
              filter === f
                ? "btn-neon"
                : "glass text-ink"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="glass rounded-[18px] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink">{displayName(u)}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3 text-muted">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u.id === currentUserId ? (
                    <span className="text-xs text-muted">You</span>
                  ) : u.status === "PENDING" || u.status === "REJECTED" ? (
                    <span className="text-xs text-muted">—</span>
                  ) : (
                    <button
                      disabled={updatingId === u.id}
                      onClick={() => toggleBlock(u.id, u.status)}
                      className={`text-xs px-3 py-1 rounded-lg glass disabled:opacity-50 ${
                        u.status === "BLOCKED"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {u.status === "BLOCKED" ? "Unblock" : "Block"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
    </FadeIn>
  );
}
