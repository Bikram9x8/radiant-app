import AuthLayout from "@/components/AuthLayout";
import CompanySignupForm from "@/components/auth/CompanySignupForm";

export default function CompanySignup() {
  return (
    <AuthLayout variant="signup">
      <CompanySignupForm />
    </AuthLayout>
  );
}
