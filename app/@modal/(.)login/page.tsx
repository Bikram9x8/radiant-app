import AuthModal from "@/components/auth/AuthModal";
import LoginForm from "@/components/auth/LoginForm";

// Opens /login as a modal when navigating from inside the app
export default function LoginModal() {
  return (
    <AuthModal label="Log in">
      <LoginForm />
    </AuthModal>
  );
}
