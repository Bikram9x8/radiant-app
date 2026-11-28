import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up as an institute | Radiant Educations",
  description: "Create a Radiant Educations account for an institute or company.",
  robots: { index: false, follow: true },
};

import AuthLayout from "@/components/AuthLayout";
import CompanySignupForm from "@/components/auth/CompanySignupForm";

export default function CompanySignup() {
  return (
    <AuthLayout variant="signup">
      <CompanySignupForm />
    </AuthLayout>
  );
}
