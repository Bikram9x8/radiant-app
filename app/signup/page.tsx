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
