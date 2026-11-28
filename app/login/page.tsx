import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in | Radiant Educations",
  description: "Log in to your Radiant Educations account.",
  robots: { index: false, follow: true },
};

import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { safeReturnTo } from "@/lib/return-to";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  return (
    <AuthLayout variant="login">
      <LoginForm returnTo={safeReturnTo(returnTo)} />
    </AuthLayout>
  );
}
