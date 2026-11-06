import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_QUESTION_SELECT,
  getAdminUserId,
  getMcqChapter,
  questionInput,
  toAdminQuestion,
  zodMessage,
} from "@/lib/mcq";

// Questions in one chapter (active first); ?includeInactive=1 also returns deactivated ones
export async function GET(req: Request) {
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  if (!chapterId) {
    return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
  }
  const includeInactive = searchParams.get("includeInactive") === "1";

  const questions = await prisma.mcqQuestion.findMany({
    where: { chapterId, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: ADMIN_QUESTION_SELECT,
  });

  return NextResponse.json({ questions: questions.map(toAdminQuestion) });
}

export async function POST(req: Request) {
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = questionInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }

  if (!(await getMcqChapter(parsed.data.chapterId))) {
    return NextResponse.json(
      { error: "Please choose a chapter in CBSE, ICSE or Competitive." },
      { status: 400 }
    );
  }

  const question = await prisma.mcqQuestion.create({
    data: parsed.data,
    select: ADMIN_QUESTION_SELECT,
  });

  return NextResponse.json({ question: toAdminQuestion(question) }, { status: 201 });
}
