import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actionStyles: Record<string, string> = {
  APPROVE_OPPORTUNITY: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
  REJECT_OPPORTUNITY: "bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  APPROVE_COMPANY: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
  REJECT_COMPANY: "bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  BLOCK_USER: "bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  UNBLOCK_USER: "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",
};

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { email: true } },
    },
  });

  return (
    <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Admin Activity Log</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        Last {logs.length} action{logs.length === 1 ? "" : "s"}
      </p>

      {logs.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-zinc-600 dark:text-zinc-400">
          No activity yet.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20 dark:border-white/10">
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Action</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Target</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">By</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Notes</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-white/5">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        actionStyles[log.action] || "bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {log.targetType} · {log.targetId.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {log.actor.email}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {log.notes || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}