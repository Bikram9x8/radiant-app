import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId, getMcqChapter, mcqTestLog, testInput, zodMessage } from "@/lib/mcq";

// Save details and/or publish state.
// The chapter can only change while the test has no questions; publishing needs an active question.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = testInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.mcqTest.findUnique({
    where: { id },
    select: { chapterId: true, isPublished: true, publishedAt: true, _count: { select: { questions: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  if (data.chapterId !== existing.chapterId) {
    if (existing._count.questions > 0) {
      return NextResponse.json(
        { error: "Remove all questions before changing the chapter." },
        { status: 409 }
      );
    }
    if (!(await getMcqChapter(data.chapterId))) {
      return NextResponse.json(
        { error: "Please choose a chapter in CBSE, ICSE or Competitive." },
        { status: 400 }
      );
    }
  }

  if (data.isPublished && !existing.isPublished) {
    const active = await prisma.mcqTestQuestion.count({ where: { testId: id, question: { isActive: true } } });
    if (active === 0) {
      return NextResponse.json(
        { error: "Add at least one active question before publishing." },
        { status: 400 }
      );
    }
  }

  const update = prisma.mcqTest.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      chapterId: data.chapterId,
      timeLimitMin: data.timeLimitMin,
      isPublished: data.isPublished,
      // publishedAt records the first publish only
      ...(data.isPublished && !existing.publishedAt ? { publishedAt: new Date() } : {}),
    },
    select: { id: true, title: true, isPublished: true, publishedAt: true },
  });

  const statusChanged = data.isPublished !== existing.isPublished;
  const [test] = statusChanged
    ? await prisma.$transaction([
        update,
        mcqTestLog(adminId, data.isPublished ? "PUBLISH_MCQ_TEST" : "UNPUBLISH_MCQ_TEST", id, data.title),
      ])
    : [await update];

  return NextResponse.json({ test });
}

// Delete a test with no attempts (its question list goes with it, the questions stay)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.mcqTest.findUnique({
    where: { id },
    select: { title: true, _count: { select: { attempts: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
  if (existing._count.attempts > 0) {
    return NextResponse.json(
      { error: "Students have taken this test, so it can't be deleted. Unpublish it instead." },
      { status: 409 }
    );
  }

  await prisma.$transaction([
    prisma.mcqTest.delete({ where: { id } }),
    mcqTestLog(adminId, "DELETE_MCQ_TEST", id, existing.title),
  ]);
  return NextResponse.json({ success: true });
}
