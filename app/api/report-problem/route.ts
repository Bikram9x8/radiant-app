import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORIES = ["WRONG_CONTENT", "FILE_PROBLEM", "LOGIN_ACCOUNT", "OTHER"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = String(body.category || "");
    const message = String(body.message || "").trim();
    const pageUrl = body.pageUrl ? String(body.pageUrl).slice(0, 500) : null;
    const email = body.email ? String(body.email).trim().slice(0, 200) : null;

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Please choose what kind of problem it is." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Please describe the problem in at least 10 characters." }, { status: 400 });
    }
    if (message.length > 3000) {
      return NextResponse.json({ error: "Message is too long (max 3000 characters)." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user ? ((session.user as any).id as string | undefined) ?? null : null;

    await prisma.problemReport.create({
      data: { category, message, pageUrl, email, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("report-problem error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
