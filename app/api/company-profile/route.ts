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

  const profile = await prisma.companyProfile.findUnique({ where: { userId } });
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

  const updated = await prisma.companyProfile.update({
    where: { userId },
    data: {
      companyName: body.companyName,
      website: body.website,
      industry: body.industry,
      description: body.description,
      logoUrl: body.logoUrl,
      contactPerson: body.contactPerson,
      contactPhone: body.contactPhone,
    },
  });

  return NextResponse.json({ success: true, profile: updated });
}
