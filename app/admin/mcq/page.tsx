import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminUserId, getMcqChapter } from "@/lib/mcq";
import { chapterLabel } from "@/lib/mcq-shared";
import {
  backLink,
  badgeDraft,
  badgePublished,
  focusRing,
  pageIntro,
  pageTitle,
  primaryButton,
  secondaryButton,
} from "./ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
] as const;

export default async function AdminMcqTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await getAdminUserId())) {
    redirect("/login");
  }

  const { status } = await searchParams;
  const filter = status === "draft" || status === "published" ? status : "all";

  const tests = await prisma.mcqTest.findMany({
    where: filter === "all" ? {} : { isPublished: filter === "published" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      chapterId: true,
      isPublished: true,
      timeLimitMin: true,
      updatedAt: true,
      _count: { select: { attempts: true } },
      questions: { where: { question: { isActive: true } }, select: { questionId: true } },
    },
  });

  const labels = new Map<string, string>();
  for (const chapterId of new Set(tests.map((t) => t.chapterId))) {
    const chapter = await getMcqChapter(chapterId);
    labels.set(chapterId, chapter ? chapterLabel(chapter) : "Chapter no longer available");
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/dashboard" className={backLink}>
        ← Dashboard
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>MCQ tests</h1>
          <p className={pageIntro}>Chapter tests built from the question bank. Students can&apos;t see drafts.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/mcq/questions" className={secondaryButton}>
            Question bank
          </Link>
          <Link href="/admin/mcq/import" className={secondaryButton}>
            Import questions
          </Link>
          <Link href="/admin/mcq/tests/new" className={primaryButton}>
            New test
          </Link>
        </div>
      </div>

      <nav aria-label="Filter tests" className="mt-6 inline-flex gap-1 rounded-xl bg-[#f6f8fb] p-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/mcq" : `/admin/mcq?status=${f.key}`}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[40px] items-center rounded-lg px-4 text-sm font-semibold ${
                active
                  ? "bg-white text-teal-dark shadow-soft"
                  : "text-muted hover:text-teal-dark"
              } ${focusRing}`}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {tests.length === 0 ? (
        <div className="card mt-4 p-5 sm:p-6">
          <p className="text-muted">
            {filter === "all" ? "No tests yet. Create the first one with New test." : "No tests match this filter."}
          </p>
        </div>
      ) : (
        <div className="card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line bg-[#f6f8fb] text-left text-muted">
                  <th scope="col" className="px-5 py-3 font-semibold">Test</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Questions</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Attempts</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f6f8fb]">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/mcq/tests/${t.id}`}
                        className={`rounded font-semibold text-ink hover:text-teal-dark hover:underline ${focusRing}`}
                      >
                        {t.title}
                      </Link>
                      <p className="mt-1 text-muted">
                        {labels.get(t.chapterId)}. {t.timeLimitMin ? `${t.timeLimitMin} minutes` : "Untimed"}.
                      </p>
                    </td>
                    <td className="px-5 py-4 text-ink">{t.questions.length}</td>
                    <td className="px-5 py-4">
                      <span className={t.isPublished ? badgePublished : badgeDraft}>
                        {t.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink">{t._count.attempts}</td>
                    <td className="px-5 py-4 text-muted">
                      {t.updatedAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
