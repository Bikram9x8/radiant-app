"use client";

import { useEffect, useState } from "react";
import FadeIn from "@/components/FadeIn";
import { useToast } from "@/components/Toast";

type LockedCode = {
  id: string;
  code: string;
  testTitle: string;
  studentEmail: string;
  lockedAt: string;
  lockReason: string | null;
};

export default function LockedTestsManager() {
  const { showToast } = useToast();
  const [lockedCodes, setLockedCodes] = useState<LockedCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/locked-tests");
    const data = await res.json();
    setLockedCodes(data.lockedCodes || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUnlock(accessCodeId: string) {
    setUnlockingId(accessCodeId);
    await fetch("/api/admin/locked-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCodeId }),
    });
    setUnlockingId(null);async function handleUnlock(accessCodeId: string) {
    setUnlockingId(accessCodeId);
    await fetch("/api/admin/locked-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCodeId }),
    });
    setUnlockingId(null);
    showToast("Student unlocked!");
    loadData();
  }
    loadData();
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading...</p>;
  }

  if (lockedCodes.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-zinc-500">No students are currently locked out of any test.</p>
      </div>
    );
  }

  return (
    <FadeIn>
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-600 dark:text-zinc-400 border-b border-white/20 dark:border-white/10">
            <th className="px-5 py-3 font-medium">Student</th>
            <th className="px-5 py-3 font-medium">Test</th>
            <th className="px-5 py-3 font-medium">Code</th>
            <th className="px-5 py-3 font-medium">Locked At</th>
            <th className="px-5 py-3 font-medium">Reason</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {lockedCodes.map((lc) => (
            <tr key={lc.id} className="border-b border-white/10 dark:border-white/5 last:border-0">
              <td className="px-5 py-3 text-zinc-900 dark:text-white">{lc.studentEmail}</td>
              <td className="px-5 py-3 text-zinc-900 dark:text-white">{lc.testTitle}</td>
              <td className="px-5 py-3 font-mono text-zinc-600 dark:text-zinc-400">{lc.code}</td>
              <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                {lc.lockedAt ? new Date(lc.lockedAt).toLocaleString() : "-"}
              </td>
              <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{lc.lockReason || "-"}</td>
              <td className="px-5 py-3">
                <button
                  onClick={() => handleUnlock(lc.id)}
                  disabled={unlockingId === lc.id}
                  className="btn-neon rounded-lg px-3 py-1.5 font-semibold text-xs disabled:opacity-50"
                >
                  {unlockingId === lc.id ? "Unlocking..." : "Unlock"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </FadeIn>
  );
}