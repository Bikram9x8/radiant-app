import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
