import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  cleanDuration,
  getInternshipBackLink,
  getInternshipsCategoryId,
  isDeadlinePassed,
  isInternshipSubcategory,
} from "@/lib/internships";

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
  let codeUnlocked = false;
  let isLocked = false;
  
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

  if (opportunity.requiresCode) {
      const usedCode = await prisma.accessCode.findFirst({
        where: {
          opportunityId: opportunity.id,
          usedByUserId: userId,
          isUsed: true,
        },
      });
      codeUnlocked = !!usedCode;
      isLocked = usedCode?.isLocked || false;
    }
  }

  // Internships only: closed state and a back link to the subcategory page
  let applicationsClosed = false;
  let backLink: { href: string; label: string } | null = null;
  if (opportunity.type === "INTERNSHIP") {
    applicationsClosed = isDeadlinePassed(opportunity.applyDeadline);
    backLink = await getInternshipBackLink(opportunity.courseNodeId, new URL(req.url).searchParams.get("level"));
  }

  return NextResponse.json({ opportunity, alreadyApplied, codeUnlocked, isLocked, applicationsClosed, backLink });
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
    duration,
    courseNodeId,
  } = body;

  const isInternship = type === "INTERNSHIP";
  if ((existing.type === "INTERNSHIP") !== isInternship) {
    return NextResponse.json(
      { error: "A post can't be changed to or from Internship. Please create a new post instead." },
      { status: 400 }
    );
  }

  if (!title || !type || (!categoryId && !isInternship) || !description || !applyDeadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let finalCategoryId = categoryId;
  let nodeUpdate: { courseNodeId?: string } = {};
  if (isInternship) {
    const internshipsCategoryId = await getInternshipsCategoryId();
    if (!internshipsCategoryId) {
      return NextResponse.json({ error: "Internships category is missing." }, { status: 500 });
    }
    finalCategoryId = internshipsCategoryId;
    if (courseNodeId !== undefined) {
      if (typeof courseNodeId !== "string" || !(await isInternshipSubcategory(courseNodeId))) {
        return NextResponse.json({ error: "Please choose a valid internship subcategory." }, { status: 400 });
      }
      nodeUpdate = { courseNodeId };
    }
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      categoryId: finalCategoryId,
      title,
      type,
      description,
      eligibility: eligibility || null,
      location: location || null,
      mode: mode || "Online",
      stipendOrPrize: stipendOrPrize || null,
      // Only touched when sent, so older clients can't blank them out.
      duration: duration !== undefined ? cleanDuration(duration) : undefined,
      ...nodeUpdate,
      applyDeadline: new Date(applyDeadline),
      eventDate: eventDate ? new Date(eventDate) : null,
      externalLink: externalLink || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ opportunity: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  await prisma.opportunity.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
