import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_QUESTION_SELECT, getAdminUserId, getMcqChapter, toAdminQuestion } from "@/lib/mcq";
import QuestionBank from "./QuestionBank";

export default async function AdminMcqQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ chapterId?: string }>;
}) {
  if (!(await getAdminUserId())) {
    redirect("/login");
  }

  const { chapterId } = await searchParams;
  const chapter = chapterId ? await getMcqChapter(chapterId) : null;
  const questions = chapter
    ? (
        await prisma.mcqQuestion.findMany({
          where: { chapterId: chapter.id },
          orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
          select: ADMIN_QUESTION_SELECT,
        })
      ).map(toAdminQuestion)
    : [];

  return (
    <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
      <Link href="/dashboard" className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-1 text-zinc-900 dark:text-white">MCQ Question Bank</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8">
        Questions for CBSE, ICSE and Competitive chapters. Tests are built from these questions.
      </p>
      {/* key: a new chapter gets fresh component state */}
      <QuestionBank
        key={chapter?.id ?? "none"}
        chapter={chapter}
        invalidChapter={!!chapterId && !chapter}
        questions={questions}
      />
    </div>
  );
}
