import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId, getMcqChapter, testInput, zodMessage } from "@/lib/mcq";

// Create a test. New tests always start as drafts.
export async function POST(req: Request) {
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = testInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: zodMessage(parsed.error) }, { status: 400 });
  }

  if (!(await getMcqChapter(parsed.data.chapterId))) {
    return NextResponse.json(
      { error: "Please choose a chapter in CBSE, ICSE or Competitive." },
      { status: 400 }
    );
  }

  const { title, description, chapterId, timeLimitMin } = parsed.data;
  const test = await prisma.mcqTest.create({
    data: { title, description, chapterId, timeLimitMin, isPublished: false },
    select: { id: true },
  });

  return NextResponse.json({ test }, { status: 201 });
}
