import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { opportunityId } = body;

  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
  }

  const accessCode = await prisma.accessCode.findFirst({
    where: {
      opportunityId,
      usedByUserId: user.id,
      isUsed: true,
    },
  });

  if (!accessCode) {
    return NextResponse.json({ error: "No active attempt found" }, { status: 404 });
  }

  await prisma.accessCode.update({
    where: { id: accessCode.id },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockReason: "Switched tabs or apps during test",
    },
  });

  return NextResponse.json({ success: true });
}