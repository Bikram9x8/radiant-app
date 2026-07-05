import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: {
      company: { select: { companyName: true, website: true, description: true } },
      category: { select: { name: true } },
    },
  });

  if (!opportunity || opportunity.status !== "APPROVED") {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  let alreadyApplied = false;

  if (session?.user && (session.user as any).role === "STUDENT") {
    const userId = (session.user as any).id;
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (studentProfile) {
      const existing = await prisma.application.findUnique({
        where: {
          studentId_opportunityId: {
            studentId: studentProfile.id,
            opportunityId: opportunity.id,
          },
        },
      });
      alreadyApplied = !!existing;
    }
  }

  return NextResponse.json({ opportunity, alreadyApplied });
}