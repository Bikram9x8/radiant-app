import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cleanDuration, getInternshipsCategoryId, isInternshipSubcategory } from "@/lib/internships";
import { EXPLICIT_TEST_DIVISIONS, READING_CONTENT_TYPES, TEST_CLASSES, isTestDivision, parseClassSubject } from "@/lib/test-posts";
import type { Division, OpportunityType } from "@prisma/client";
import { SHOW_SCHOOL } from "@/lib/features";
import { SCHOOL_TEST_DIVISION, notSchoolWhere } from "@/lib/school-posts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const division = searchParams.get("division") || "";
  const chapter = searchParams.get("chapter") || "";
  // Tests page: ?tests=1 keeps only tests (see lib/test-posts.ts); ?classNo=9..12 filters by class
  const testsOnly = searchParams.get("tests") === "1";
  const classParam = searchParams.get("classNo") || "";
  const classNo = TEST_CLASSES.includes(classParam) ? classParam : "";
  // In tests mode only the test divisions filter; any other division is ignored (the page shows a note).
  // With School Education switched off, board-level tests are School, so that division is ignored too.
  const isVisibleTestDivision = isTestDivision(division) && (SHOW_SCHOOL || division !== SCHOOL_TEST_DIVISION);
  const divisionFilter = testsOnly ? (isVisibleTestDivision ? division : "") : division;
  // School Education switched off: School posts (incl. board-level tests) are left out
  const schoolWhere = SHOW_SCHOOL ? {} : notSchoolWhere;

  // Tests page: only tests, and only those that haven't ended (reading material has no end date)
  const testsWhere = testsOnly
    ? {
        AND: [
          { OR: [{ type: "QUIZ" as const }, { division: { in: EXPLICIT_TEST_DIVISIONS as Division[] } }] },
          { OR: [{ applyDeadline: { gte: new Date() } }, { contentType: { in: READING_CONTENT_TYPES } }] },
        ],
      }
    : {};
  // ?subject=Physics (Tests page while School is off): the subject part of the category name, any class.
  // Only plain subject names are accepted; anything else is ignored.
  const subjectParam = (searchParams.get("subject") || "").trim();
  const subject = /^[A-Za-z][A-Za-z &.-]{0,39}$/.test(subjectParam) ? subjectParam : "";
  // Category names look like "Class 12 - Physics"
  const classWhere =
    classNo || subject
      ? {
          category: {
            name: {
              ...(classNo ? { startsWith: `Class ${classNo} -` } : {}),
              ...(subject ? { endsWith: `- ${subject}` } : {}),
              mode: "insensitive" as const,
            },
          },
        }
      : {};

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "APPROVED",
      ...testsWhere,
      ...classWhere,
      ...schoolWhere,
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(type ? { type: type as OpportunityType } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(divisionFilter ? { division: divisionFilter as Division } : {}),
      ...(chapter ? { chapter: parseInt(chapter, 10) } : {}),
    },
    include: {
      company: { select: { companyName: true } },
      category: { select: { name: true } },
    },
    // Tests: latest closing date first, so open tests come before ended ones
    orderBy: { applyDeadline: testsOnly ? "desc" : "asc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Tests page: the subjects that actually have tests in the chosen class (for the Subject chips)
  let subjects: { id: string; name: string }[] = [];
  if (testsOnly && classNo) {
    const rows = await prisma.opportunity.findMany({
      where: { status: "APPROVED", ...testsWhere, ...classWhere, ...schoolWhere },
      distinct: ["categoryId"],
      select: { category: { select: { id: true, name: true } } },
    });
    subjects = rows.map((r) => r.category).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Tests page without a class (School switched off): subject names that have tests, across classes,
  // within the chosen test type ("Physics", "Mathematics"...). Category names are not changed.
  let subjectNames: string[] = [];
  if (testsOnly && !classNo) {
    const rows = await prisma.opportunity.findMany({
      where: {
        status: "APPROVED",
        ...testsWhere,
        ...schoolWhere,
        ...(divisionFilter ? { division: divisionFilter as Division } : {}),
      },
      distinct: ["categoryId"],
      select: { category: { select: { name: true } } },
    });
    subjectNames = [
      ...new Set(rows.map((r) => parseClassSubject(r.category.name).subject).filter((s): s is string => !!s)),
    ].sort((a, b) => a.localeCompare(b));
  }

  return NextResponse.json({ opportunities, categories, subjects, subjectNames });
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

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
