import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const body = await req.json();

  const updated = await prisma.studentProfile.update({
    where: { userId },
    data: {
      fullName: body.fullName,
      phone: body.phone,
      college: body.college,
      degree: body.degree,
      graduationYr: body.graduationYr ? Number(body.graduationYr) : null,
      skills: Array.isArray(body.skills) ? body.skills : [],
      bio: body.bio,
      linkedinUrl: body.linkedinUrl,
      githubUrl: body.githubUrl,
      portfolioUrl: body.portfolioUrl,
    },
  });

  return NextResponse.json({ success: true, profile: updated });
}
