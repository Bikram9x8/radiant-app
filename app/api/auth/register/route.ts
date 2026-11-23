import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { SHOW_SCHOOL } from "@/lib/features";

// Only these roles can be chosen at sign-up. ADMIN (or anything else) is never accepted here.
const SIGNUP_ROLES = ["STUDENT", "COMPANY"] as const;
type SignupRole = (typeof SIGNUP_ROLES)[number];

function isSignupRole(value: unknown): value is SignupRole {
  return typeof value === "string" && (SIGNUP_ROLES as readonly string[]).includes(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, fullName, companyName } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSignupRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
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

      await sendEmail({
        to: user.email,
        subject: "Welcome to Radiant Educations!",
        html: `
          <p>Hi${fullName ? " " + fullName : ""},</p>
          <p>Welcome to <strong>Radiant Educations</strong>! Your account has been created successfully.</p>
          <p>You now have free access to ${SHOW_SCHOOL ? "Class 12 and entrance exam practice tests" : "entrance exam practice tests"}, study material, and career tools.</p>
          <p><a href="https://app.radianteducareer.com/login">Log in and get started →</a></p>
        `,
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
