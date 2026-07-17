import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });

  if (!opportunity || opportunity.companyId !== companyProfile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { opportunityId: id },
    include: {
      student: {
        select: {
          fullName: true,
          phone: true,
          college: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({ opportunity, applications });
}
