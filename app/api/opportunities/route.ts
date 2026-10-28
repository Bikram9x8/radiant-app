import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cleanDuration, getInternshipsCategoryId, isInternshipSubcategory } from "@/lib/internships";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const division = searchParams.get("division") || "";
  const chapter = searchParams.get("chapter") || "";

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "APPROVED",
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(type ? { type: type as any } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(division ? { division: division as any } : {}),
      ...(chapter ? { chapter: parseInt(chapter, 10) } : {}),
    },
    include: {
      company: { select: { companyName: true } },
      category: { select: { name: true } },
    },
    orderBy: { applyDeadline: "asc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ opportunities, categories });
}
export async function POST(req: Request) {
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
    requiresCode,
    division,
    chapter,
    courseNodeId,
    contentType,
    duration,
  } = body;

  const isInternship = type === "INTERNSHIP";

  if (!title || !type || (!categoryId && !isInternship) || !description || !applyDeadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let finalCategoryId = categoryId;
  let linkedNodeId: string | null = null;
  if (isInternship) {
    if (typeof courseNodeId !== "string" || !(await isInternshipSubcategory(courseNodeId))) {
      return NextResponse.json({ error: "Please choose a valid internship subcategory." }, { status: 400 });
    }
    const internshipsCategoryId = await getInternshipsCategoryId();
    if (!internshipsCategoryId) {
      return NextResponse.json({ error: "Internships category is missing." }, { status: 500 });
    }
    finalCategoryId = internshipsCategoryId;
    linkedNodeId = courseNodeId;
  } else if (courseNodeId) {
    const node = await prisma.courseNode.findUnique({ where: { id: courseNodeId } });
    if (!node || node.kind !== "CHAPTER") {
      return NextResponse.json({ error: "Please choose a valid chapter." }, { status: 400 });
    }
    linkedNodeId = node.id;
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      companyId: companyProfile.id,
      categoryId: finalCategoryId,
      title,
      type,
      description,
      eligibility: eligibility || null,
      location: location || null,
      mode: mode || "Online",
      stipendOrPrize: stipendOrPrize || null,
      duration: cleanDuration(duration),
      applyDeadline: new Date(applyDeadline),
      eventDate: eventDate ? new Date(eventDate) : null,
      externalLink: externalLink || null,
      requiresCode: requiresCode === true,
      division: division || "TEST_SERIES",
      chapter: !isInternship && typeof chapter === "number" ? chapter : null,
      courseNodeId: linkedNodeId,
      contentType: linkedNodeId && !isInternship ? contentType || null : null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ opportunity }, { status: 201 });
}
