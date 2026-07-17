"use client";

import { useState } from "react";

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
  APPROVED: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
  PENDING: "bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
  BLOCKED: "bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  REJECTED: "bg-zinc-200/80 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400",
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
    <div>
      <div className="flex gap-2 mb-4">
        {(["ALL", "STUDENT", "COMPANY", "ADMIN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-xl ${
              filter === f
                ? "bg-purple-600 text-white"
                : "glass text-zinc-900 dark:text-white"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 dark:border-white/10">
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Role</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:divide-white/5">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{displayName(u)}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[u.status]}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {u.id === currentUserId ? (
                    <span className="text-xs text-zinc-500">You</span>
                  ) : u.status === "PENDING" || u.status === "REJECTED" ? (
                    <span className="text-xs text-zinc-500">—</span>
                  ) : (
                    <button
                      disabled={updatingId === u.id}
                      onClick={() => toggleBlock(u.id, u.status)}
                      className={`text-xs px-3 py-1 rounded-lg glass disabled:opacity-50 ${
                        u.status === "BLOCKED"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
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
  );
}
