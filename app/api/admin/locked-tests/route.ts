import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lockedCodes = await prisma.accessCode.findMany({
    where: { isLocked: true },
    orderBy: { lockedAt: "desc" },
    include: {
      opportunity: { select: { title: true } },
    },
  });

  const userIds = lockedCodes.map((c) => c.usedByUserId).filter(Boolean) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.email]));

  const results = lockedCodes.map((c) => ({
    id: c.id,
    code: c.code,
    testTitle: c.opportunity.title,
    studentEmail: c.usedByUserId ? userMap.get(c.usedByUserId) || "Unknown" : "Unknown",
    lockedAt: c.lockedAt,
    lockReason: c.lockReason,
  }));

  return NextResponse.json({ lockedCodes: results });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { accessCodeId } = body;

  if (!accessCodeId) {
    return NextResponse.json({ error: "Missing accessCodeId" }, { status: 400 });
  }

  await prisma.accessCode.update({
    where: { id: accessCodeId },
    data: {
      isLocked: false,
      lockedAt: null,
      lockReason: null,
    },
  });

  return NextResponse.json({ success: true });
}