import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const application = await prisma.application.findUnique({
    where: { id },
    include: { opportunity: true },
  });

  if (!application || application.opportunity.companyId !== companyProfile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status } = body;

  const validStatuses = ["APPLIED", "SHORTLISTED", "REJECTED", "SELECTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ application: updated });
}