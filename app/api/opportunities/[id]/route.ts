import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
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
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: user.id },
  });

  if (!companyProfile) {
    return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
  }

  const existing = await prisma.opportunity.findUnique({ where: { id } });

  if (!existing || existing.companyId !== companyProfile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    title,
    type,
    categoryId,
    description,
    eligibility,
    location,
    mode,
    stipendOrPrize,
    applyDeadline,
    eventDate,
    externalLink,
  } = body;

  if (!title || !type || !categoryId || !description || !applyDeadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      categoryId,
      title,
      type,
      description,
      eligibility: eligibility || null,
      location: location || null,
      mode: mode || "Online",
      stipendOrPrize: stipendOrPrize || null,
      applyDeadline: new Date(applyDeadline),
      eventDate: eventDate ? new Date(eventDate) : null,
      externalLink: externalLink || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ opportunity: updated });
}