import AuthModal from "@/components/auth/AuthModal";
import LoginForm from "@/components/auth/LoginForm";
import { safeReturnTo } from "@/lib/return-to";

// Opens /login as a modal when navigating from inside the app
export default async function LoginModal({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  return (
    <AuthModal label="Log in" variant="login">
      <LoginForm returnTo={safeReturnTo(returnTo)} />
    </AuthModal>
  );
}
