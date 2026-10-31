import AuthModal from "@/components/auth/AuthModal";
import StudentSignupForm from "@/components/auth/StudentSignupForm";

// Opens /signup as a modal when navigating from inside the app
export default function StudentSignupModal() {
  return (
    <AuthModal label="Sign up">
      <StudentSignupForm />
    </AuthModal>
  );
}
