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

  if (id === user.id) {
    return NextResponse.json({ error: "Can't change your own status" }, { status: 400 });
  }

  const body = await req.json();
  const { status } = body;

  const validStatuses = ["APPROVED", "BLOCKED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
  });

  await prisma.adminLog.create({
    data: {
      actorId: user.id,
      action: status === "BLOCKED" ? "BLOCK_USER" : "UNBLOCK_USER",
      targetType: "User",
      targetId: id,
    },
  });

  return NextResponse.json({ user: updated });
}
