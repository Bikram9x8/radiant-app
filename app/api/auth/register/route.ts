import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, fullName, companyName } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        status: role === "COMPANY" ? "PENDING" : "APPROVED",
      },
    });

    if (role === "STUDENT") {
      await prisma.studentProfile.create({
        data: { userId: user.id, fullName: fullName || "" },
      });
    } else if (role === "COMPANY") {
      await prisma.companyProfile.create({
        data: { userId: user.id, companyName: companyName || "" },
      });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
