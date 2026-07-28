import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Please log in as a student to redeem a code." }, { status: 401 });
  }

  const body = await req.json();
  const { opportunityId, code } = body;

  if (!opportunityId || !code) {
    return NextResponse.json({ error: "Missing opportunityId or code" }, { status: 400 });
  }

  const accessCode = await prisma.accessCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!accessCode || accessCode.opportunityId !== opportunityId) {
    return NextResponse.json({ error: "Invalid code for this test." }, { status: 400 });
  }

  if (accessCode.isUsed) {
    return NextResponse.json({ error: "This code has already been used." }, { status: 400 });
  }

  await prisma.accessCode.update({
    where: { id: accessCode.id },
    data: {
      isUsed: true,
      usedByUserId: user.id,
      usedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}