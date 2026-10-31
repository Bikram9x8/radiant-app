import AuthModal from "@/components/auth/AuthModal";
import CompanySignupForm from "@/components/auth/CompanySignupForm";

// Opens /signup/company as a modal when navigating from inside the app
export default function CompanySignupModal() {
  return (
    <AuthModal label="Sign up">
      <CompanySignupForm />
    </AuthModal>
  );
}
