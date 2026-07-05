import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { studentId: studentProfile.id },
    include: {
      opportunity: {
        select: {
          id: true,
          title: true,
          type: true,
          applyDeadline: true,
          company: { select: { companyName: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({ applications });
}
