import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 7; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RAD-${result}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { opportunityId, count } = body;

  if (!opportunityId || !count || count < 1 || count > 500) {
    return NextResponse.json({ error: "Invalid opportunityId or count" }, { status: 400 });
  }

  const codesToCreate = [];
  for (let i = 0; i < count; i++) {
    codesToCreate.push({
      code: generateCode(),
      opportunityId,
    });
  }

  await prisma.accessCode.createMany({ data: codesToCreate });

  const codes = await prisma.accessCode.findMany({
    where: { opportunityId },
    orderBy: { createdAt: "desc" },
    take: count,
  });

  return NextResponse.json({ codes }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const opportunityId = searchParams.get("opportunityId") || "";

  const codes = await prisma.accessCode.findMany({
    where: opportunityId ? { opportunityId } : {},
    orderBy: { createdAt: "desc" },
    include: { opportunity: { select: { title: true } } },
  });

  return NextResponse.json({ codes });
}
