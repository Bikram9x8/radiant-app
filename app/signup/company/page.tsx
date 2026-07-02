"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanySignup() {
  const router = useRouter();
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
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border rounded-lg">
      <h1 className="text-2xl font-bold mb-2">Company sign up</h1>
      <p className="text-sm text-gray-500 mb-6">Your account needs admin approval before you can post opportunities.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="Company name" className="border rounded px-3 py-2"
          value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
        <input type="email" placeholder="Email" className="border rounded px-3 py-2"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" className="border rounded px-3 py-2"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="bg-blue-700 text-white rounded px-3 py-2 font-semibold">
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
