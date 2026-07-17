import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { status, rejectionReason } = body;

  const validStatuses = ["APPROVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason || null : null,
    },
  });

  await prisma.adminLog.create({
    data: {
      actorId: user.id,
      action: status === "APPROVED" ? "APPROVE_OPPORTUNITY" : "REJECT_OPPORTUNITY",
      targetType: "Opportunity",
      targetId: id,
      notes: rejectionReason || null,
    },
  });

  return NextResponse.json({ opportunity: updated });
}
