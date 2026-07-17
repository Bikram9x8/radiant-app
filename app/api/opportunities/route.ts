import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "APPROVED",
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(type ? { type: type as any } : {}),
      ...(categoryId ? { categoryId } : {}),
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
  } = body;

  if (!title || !type || !categoryId || !description || !applyDeadline) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      companyId: companyProfile.id,
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

  return NextResponse.json({ opportunity }, { status: 201 });
}
