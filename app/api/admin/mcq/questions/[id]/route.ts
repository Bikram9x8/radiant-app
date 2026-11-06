import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_QUESTION_SELECT,
  getAdminUserId,
  getMcqChapter,
  questionActiveInput,
  questionInput,
  toAdminQuestion,
  zodMessage,
} from "@/lib/mcq";

// Edit a question. Edits apply to future attempts; past attempts keep their stored score.
// Moving it to another chapter is only allowed while it isn't in any test.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = questionInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }

  const existing = await prisma.mcqQuestion.findUnique({
    where: { id },
    select: { chapterId: true, _count: { select: { testLinks: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  if (parsed.data.chapterId !== existing.chapterId) {
    if (existing._count.testLinks > 0) {
      return NextResponse.json(
        { error: "This question is in a test, so it can't move to another chapter." },
        { status: 409 }
      );
    }
    if (!(await getMcqChapter(parsed.data.chapterId))) {
      return NextResponse.json(
        { error: "Please choose a chapter in CBSE, ICSE or Competitive." },
        { status: 400 }
      );
    }
  }

  const question = await prisma.mcqQuestion.update({
    where: { id },
    data: parsed.data,
    select: ADMIN_QUESTION_SELECT,
  });

  return NextResponse.json({ question: toAdminQuestion(question) });
}

// Deactivate / reactivate. Deactivated questions drop out of tests.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = questionActiveInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }

  const existing = await prisma.mcqQuestion.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const question = await prisma.mcqQuestion.update({
    where: { id },
    data: { isActive: parsed.data.isActive },
    select: ADMIN_QUESTION_SELECT,
  });

  return NextResponse.json({ question: toAdminQuestion(question) });
}

// Hard delete, only for a question never used in a test or an attempt
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.mcqQuestion.findUnique({
    where: { id },
    select: { _count: { select: { testLinks: true, answers: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  if (existing._count.testLinks > 0 || existing._count.answers > 0) {
    return NextResponse.json(
      { error: "This question has been used in a test. Deactivate it instead." },
      { status: 409 }
    );
  }

  await prisma.mcqQuestion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
