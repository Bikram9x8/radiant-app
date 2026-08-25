import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { status } = body;

  const validStatuses = ["APPROVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "COMPANY") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
  });

  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: id },
  });

  if (status === "APPROVED") {
    await sendEmail({
      to: updated.email,
      subject: "Your company account has been approved!",
      html: `
        <p>Hi${companyProfile?.companyName ? " " + companyProfile.companyName : ""},</p>
        <p>Your company account on <strong>Radiant Educations</strong> has been approved. You can now log in and start posting opportunities.</p>
        <p><a href="https://app.radianteducareer.com/login">Log in here</a></p>
      `,
    });
  } else if (status === "REJECTED") {
    await sendEmail({
      to: updated.email,
      subject: "Update on your Radiant Educations account",
      html: `
        <p>Hi${companyProfile?.companyName ? " " + companyProfile.companyName : ""},</p>
        <p>Unfortunately, your company account application on Radiant Educations was not approved at this time.</p>
      `,
    });
  }

  await prisma.adminLog.create({
    data: {
      actorId: user.id,
      action: status === "APPROVED" ? "APPROVE_COMPANY" : "REJECT_COMPANY",
      targetType: "User",
      targetId: id,
    },
  });

  return NextResponse.json({ user: updated });
}
