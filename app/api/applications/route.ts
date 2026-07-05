import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can apply" }, { status: 403 });
  }
  const userId = (session.user as any).id;

  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const { opportunityId, coverNote } = body;

  if (!opportunityId) {
    return NextResponse.json({ error: "Missing opportunityId" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity || opportunity.status !== "APPROVED") {
    return NextResponse.json({ error: "Opportunity not available" }, { status: 404 });
  }

  const latestResume = await prisma.resume.findFirst({
    where: { studentId: studentProfile.id },
    orderBy: { uploadedAt: "desc" },
  });

  try {
    const application = await prisma.application.create({
      data: {
        studentId: studentProfile.id,
        opportunityId,
        coverNote: coverNote || null,
        resumeUrl: latestResume?.fileUrl || null,
      },
    });
    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "You already applied to this opportunity" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
