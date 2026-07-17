"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentSignup() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="glass rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-white">Student sign up</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Free access to Class 12 and entrance exam practice tests
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name"
            className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white rounded-xl px-3 py-2.5 font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
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
    </div>
  );
}