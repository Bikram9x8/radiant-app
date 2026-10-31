"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField, SignupSwitch, authButton, authInput, authLabel, authLink } from "@/components/AuthLayout";
import AuthLink from "@/components/auth/AuthLink";
import { useToast } from "@/components/Toast";

export default function CompanySignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ companyName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const uid = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "COMPANY" }),
    });
    setLoading(false);
    if (res.ok) {
      showToast("Account created — pending admin approval!");
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <>
      <SignupSwitch current="company" />
      <h1 className="text-2xl font-bold tracking-tight text-[#14142b]">Create your free account</h1>
      <p className="mt-1 mb-6 text-sm text-[#52516b]">It only takes a minute to get started.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="rounded-xl bg-[#fef3c7] px-4 py-3 text-sm text-[#713f12]">
          Company accounts are checked by our team before you can post.
        </p>
        <div>
          <label htmlFor={`${uid}-signup-companyName`} className={authLabel}>
            Company name
          </label>
          <input
            id={`${uid}-signup-companyName`}
            type="text"
            autoComplete="organization"
            className={authInput}
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor={`${uid}-signup-email`} className={authLabel}>
            Email
          </label>
          <input
            id={`${uid}-signup-email`}
            type="email"
            autoComplete="email"
            className={authInput}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <PasswordField
          id={`${uid}-signup-password`}
          autoComplete="new-password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          minLength={6}
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={`${authButton} mt-2`}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#52516b]">
        Already have an account?{" "}
        <AuthLink href="/login" className={authLink}>
          Log in
        </AuthLink>
      </p>
    </>
  );
}
