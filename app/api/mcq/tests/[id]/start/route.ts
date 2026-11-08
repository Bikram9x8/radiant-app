import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signStartToken } from "@/lib/mcq";

// Start a published test: returns a signed start token. Writes nothing (guests and abandoned tests leave no trace).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await prisma.mcqTest.findFirst({ where: { id, isPublished: true }, select: { id: true } });
  if (!test) {
    return NextResponse.json({ error: "This test isn't available." }, { status: 404 });
  }

  const now = new Date();
  return NextResponse.json({
    token: signStartToken(test.id, now),
    startedAt: now.getTime(),
    serverNow: Date.now(), // lets the browser correct for a wrong phone clock
  });
}
