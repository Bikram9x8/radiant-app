import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FadeIn from "@/components/FadeIn";

const actionStyles: Record<string, string> = {
  APPROVE_OPPORTUNITY: "bg-emerald-100/80 text-emerald-800",
  REJECT_OPPORTUNITY: "bg-red-100/80 text-red-800",
  APPROVE_COMPANY: "bg-emerald-100/80 text-emerald-800",
  REJECT_COMPANY: "bg-red-100/80 text-red-800",
  BLOCK_USER: "bg-red-100/80 text-red-800",
  UNBLOCK_USER: "bg-emerald-100/80 text-emerald-800",
  PUBLISH_MCQ_TEST: "bg-emerald-100/80 text-emerald-800",
  UNPUBLISH_MCQ_TEST: "bg-amber-100/80 text-amber-800",
  DELETE_MCQ_TEST: "bg-red-100/80 text-red-800",
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
      <h1 className="text-2xl font-bold mb-1 text-ink">Admin Activity Log</h1>
      <p className="text-muted text-sm mb-8">
        Last {logs.length} action{logs.length === 1 ? "" : "s"}
      </p>

      {logs.length === 0 ? (
        <div className="glass rounded-[18px] p-10 text-center text-muted">
          No activity yet.
        </div>
      ) : (
        <FadeIn>
        <div className="glass rounded-[18px] overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left px-4 py-3 font-medium text-muted">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Target</th>
                <th className="text-left px-4 py-3 font-medium text-muted">By</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Notes</th>
                <th className="text-left px-4 py-3 font-medium text-muted">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        actionStyles[log.action] || "bg-zinc-100/80 text-ink-2"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.targetType} · {log.targetId.slice(0, 12)}...
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.actor.email}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.notes || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </FadeIn>
      )}
    </div>
  );
}