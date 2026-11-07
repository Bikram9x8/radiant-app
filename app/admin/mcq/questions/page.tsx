import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_QUESTION_SELECT, getAdminUserId, getMcqChapter, toAdminQuestion } from "@/lib/mcq";
import QuestionBank from "./QuestionBank";
import { backLink, pageIntro, pageTitle } from "../ui";

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
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/admin/mcq" className={backLink}>
        ← MCQ tests
      </Link>
      <h1 className={pageTitle}>Question bank</h1>
      <p className={`${pageIntro} mb-6`}>
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
