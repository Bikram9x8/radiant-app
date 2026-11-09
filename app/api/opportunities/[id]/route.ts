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

  // Where this post sits in the course tree (read-only): used for the "Back to chapter" link
  // and for which menu item the header highlights.
  const place = await getCoursePlace(opportunity.courseNodeId);

  // Internships only: closed state and a back link to the subcategory page
  let applicationsClosed = false;
  let backLink: { href: string; label: string } | null = null;
  if (opportunity.type === "INTERNSHIP") {
    applicationsClosed = isDeadlinePassed(opportunity.applyDeadline);
    backLink = await getInternshipBackLink(opportunity.courseNodeId, new URL(req.url).searchParams.get("level"));
  } else if (place?.isChapter) {
    // Notes, solutions, tests, PYQs... posted to a chapter: back to that chapter page
    backLink = { href: place.href, label: "chapter" };
  }

  // Header menu item for this post: School Education for school/competitive/vocational courses,
  // Higher Education for higher-education (incl. internships), Tests for posts with no course.
  const navSection = place ? (place.rootSlug === "higher-education" ? "/higher" : "/school") : "/opportunities";

  return NextResponse.json({ opportunity, alreadyApplied, codeUnlocked, isLocked, applicationsClosed, backLink, navSection });
  }

// Walks up from a course node to the root. Returns the node's /courses/... URL, whether it is a
// chapter, and the root course slug. null if there is no node, the chain is broken, or any node
// on the way is inactive (the /courses page would 404 for it).
async function getCoursePlace(
  courseNodeId: string | null
): Promise<{ href: string; isChapter: boolean; rootSlug: string } | null> {
  if (!courseNodeId) return null;
  const slugs: string[] = [];
  let isChapter = false;
  let nextId: string | null = courseNodeId;
  for (let depth = 0; nextId && depth < 10; depth++) {
    const node: { slug: string; kind: string; isActive: boolean; parentId: string | null } | null =
      await prisma.courseNode.findUnique({
        where: { id: nextId },
        select: { slug: true, kind: true, isActive: true, parentId: true },
      });
    if (!node || !node.isActive) return null;
    if (depth === 0) isChapter = node.kind === "CHAPTER";
    slugs.unshift(node.slug);
    nextId = node.parentId;
  }
  if (nextId || slugs.length === 0) return null; // deeper than expected: don't guess a URL
  return { href: "/courses/" + slugs.join("/"), isChapter, rootSlug: slugs[0] };
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
