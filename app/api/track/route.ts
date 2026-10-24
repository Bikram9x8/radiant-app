import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
    const courseNodeId =
      typeof body.courseNodeId === "string" ? body.courseNodeId.slice(0, 60) : null;
    const opportunityId =
      typeof body.opportunityId === "string" ? body.opportunityId.slice(0, 60) : null;

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    await prisma.pageView.create({
      data: { path, courseNodeId, opportunityId, userId },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Tracking must never break the site
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}