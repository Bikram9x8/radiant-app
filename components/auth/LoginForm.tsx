"use client";
import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PasswordField, authButton, authInput, authLabel, authLink } from "@/components/AuthLayout";
import AuthLink from "@/components/auth/AuthLink";
import { useToast } from "@/components/Toast";
import { safeReturnTo, withReturnTo } from "@/lib/return-to";

// returnTo: set only when login was opened from a page that wants the user back (MCQ test results)
export default function LoginForm({ returnTo: rawReturnTo = null }: { returnTo?: string | null }) {
  const returnTo = safeReturnTo(rawReturnTo);
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const uid = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email: form.email, password: form.password });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      showToast("Invalid email or password", "error");
    } else if (returnTo) {
      // Full load: closes the modal and shows the page fresh with the new session
      window.location.assign(returnTo);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-[#14142b]">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-[#52516b]">Log in to continue learning.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor={`${uid}-login-email`} className={authLabel}>
            Email
          </label>
          <input
            id={`${uid}-login-email`}
            type="email"
            autoComplete="email"
            className={authInput}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <PasswordField
          id={`${uid}-login-password`}
          autoComplete="current-password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={`${authButton} mt-2`}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#52516b]">
        New here?{" "}
        <AuthLink href={withReturnTo("/signup", returnTo)} className={authLink}>
          Create a free account
        </AuthLink>
      </p>
    </>
  );
}
