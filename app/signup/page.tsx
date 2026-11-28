import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up free | Radiant Educations",
  description: "Create a free Radiant Educations student account.",
  robots: { index: false, follow: true },
};

import AuthLayout from "@/components/AuthLayout";
import StudentSignupForm from "@/components/auth/StudentSignupForm";
import { safeReturnTo } from "@/lib/return-to";

export default async function StudentSignup({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  return (
    <AuthLayout variant="signup">
      <StudentSignupForm returnTo={safeReturnTo(returnTo)} />
    </AuthLayout>
  );
}
