import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_QUESTION_SELECT, getAdminUserId, getMcqChapter, toAdminQuestion } from "@/lib/mcq";
import TestEditor from "./TestEditor";
import { backLink, pageTitle } from "../../ui";

export default async function EditMcqTestPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUserId())) {
    redirect("/login");
  }
  const { id } = await params;

  const test = await prisma.mcqTest.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      chapterId: true,
      timeLimitMin: true,
      isPublished: true,
      _count: { select: { attempts: true } },
      questions: { orderBy: { position: "asc" }, select: { question: { select: ADMIN_QUESTION_SELECT } } },
    },
  });
  if (!test) notFound();

  const chapter = await getMcqChapter(test.chapterId);
  // Active questions in the test's chapter, for "Add from bank"
  const bank = chapter
    ? (
        await prisma.mcqQuestion.findMany({
          where: { chapterId: test.chapterId, isActive: true },
          orderBy: { createdAt: "asc" },
          select: ADMIN_QUESTION_SELECT,
        })
      ).map(toAdminQuestion)
    : [];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/admin/mcq" className={backLink}>
        ← MCQ tests
      </Link>
      <h1 className={`${pageTitle} mb-6`}>Edit test</h1>
      {/* key: after a chapter change the editor starts fresh with that chapter's bank */}
      <TestEditor
        key={test.chapterId}
        test={{
          id: test.id,
          title: test.title,
          description: test.description,
          chapterId: test.chapterId,
          timeLimitMin: test.timeLimitMin,
          isPublished: test.isPublished,
          attempts: test._count.attempts,
        }}
        chapter={chapter}
        questions={test.questions.map((tq) => toAdminQuestion(tq.question))}
        bank={bank}
      />
    </div>
  );
}
