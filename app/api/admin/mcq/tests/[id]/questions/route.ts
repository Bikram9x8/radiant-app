import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId, testQuestionsInput, zodMessage } from "@/lib/mcq";

// Replace a test's ordered question list. Questions must be from the test's chapter;
// deactivated questions can stay if already listed but can't be newly added.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = testQuestionsInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }
  const ids = parsed.data.questionIds;

  const test = await prisma.mcqTest.findUnique({
    where: { id },
    select: { chapterId: true, isPublished: true, questions: { select: { questionId: true } } },
  });
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const listed = new Set(test.questions.map((q) => q.questionId));
  const rows = await prisma.mcqQuestion.findMany({
    where: { id: { in: ids } },
    select: { id: true, chapterId: true, isActive: true },
  });
  if (rows.length !== ids.length) {
    return NextResponse.json({ error: "One of the questions no longer exists." }, { status: 400 });
  }
  if (rows.some((r) => r.chapterId !== test.chapterId)) {
    return NextResponse.json({ error: "Questions must be from this test's chapter." }, { status: 400 });
  }
  if (rows.some((r) => !r.isActive && !listed.has(r.id))) {
    return NextResponse.json({ error: "Deactivated questions can't be added to a test." }, { status: 400 });
  }
  if (test.isPublished && !rows.some((r) => r.isActive)) {
    return NextResponse.json(
      { error: "A published test needs at least one active question. Unpublish it first." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.mcqTestQuestion.deleteMany({ where: { testId: id } }),
    prisma.mcqTestQuestion.createMany({
      data: ids.map((questionId, position) => ({ testId: id, questionId, position })),
    }),
    prisma.mcqTest.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  return NextResponse.json({ success: true, count: ids.length });
}
