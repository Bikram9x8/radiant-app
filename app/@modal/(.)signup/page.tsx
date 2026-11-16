import AuthModal from "@/components/auth/AuthModal";
import StudentSignupForm from "@/components/auth/StudentSignupForm";
import { safeReturnTo } from "@/lib/return-to";

// Opens /signup as a modal when navigating from inside the app
export default async function StudentSignupModal({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  return (
    <AuthModal label="Sign up" variant="signup">
      <StudentSignupForm returnTo={safeReturnTo(returnTo)} />
    </AuthModal>
  );
}
