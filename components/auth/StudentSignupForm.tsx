"use client";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField, SignupSwitch, authButton, authInput, authLabel, authLink } from "@/components/AuthLayout";
import AuthLink from "@/components/auth/AuthLink";
import { useToast } from "@/components/Toast";

export default function StudentSignupForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
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
      body: JSON.stringify({ ...form, role: "STUDENT" }),
    });
    setLoading(false);
    if (res.ok) {
      showToast("Account created — please log in!");
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <>
      <SignupSwitch current="student" />
      <h1 className="text-2xl font-bold tracking-tight text-[#14142b]">Create your free account</h1>
      <p className="mt-1 mb-6 text-sm text-[#52516b]">It only takes a minute to get started.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor={`${uid}-signup-fullName`} className={authLabel}>
            Full name
          </label>
          <input
            id={`${uid}-signup-fullName`}
            type="text"
            autoComplete="name"
            className={authInput}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
