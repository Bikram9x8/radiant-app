import AuthLayout from "@/components/AuthLayout";
import StudentSignupForm from "@/components/auth/StudentSignupForm";

export default function StudentSignup() {
  return (
    <AuthLayout variant="signup">
      <StudentSignupForm />
    </AuthLayout>
  );
}
