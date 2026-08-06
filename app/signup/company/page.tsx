"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { useToast } from "@/components/Toast";

export default function CompanySignup() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ companyName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <FadeIn>
      <div className="glass rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">Company sign up</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Your account needs admin approval before you can post tests or opportunities.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Company name"
            className="bg-white/70 dark:bg-zinc-900/70 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-white/70 dark:bg-zinc-900/70 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-white/70 dark:bg-zinc-900/70 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-neon rounded-2xl px-4 py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
      </FadeIn>
    </div>
  );
}
