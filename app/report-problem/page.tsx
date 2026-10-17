"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "WRONG_CONTENT", label: "Wrong or missing content (answer, question, chapter)" },
  { value: "FILE_PROBLEM", label: "A PDF or file will not open or upload" },
  { value: "LOGIN_ACCOUNT", label: "Login or account problem" },
  { value: "OTHER", label: "Something else" },
];

export default function ReportProblemPage() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/report-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, pageUrl, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Could not send. Please check your internet and try again.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex-1 bg-white">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold">✓</div>
          <h1 className="mt-5 text-3xl font-extrabold text-[#14142b]">Thank you</h1>
          <p className="mt-3 text-zinc-600">Your report has been sent. We will look into it.</p>
          <a href="/" className="btn-neon inline-block mt-6 rounded-xl px-6 py-3 font-semibold">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14142b]">Report a problem</h1>
        <p className="mt-3 text-zinc-600">Found a mistake or something not working? Tell us and we will fix it.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#14142b] mb-1.5">What kind of problem is it?</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[#14142b] outline-none focus:border-[#5b33d6]"
            >
              <option value="">Choose one</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#14142b] mb-1.5">Describe the problem</label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="For example: Class 10 Maths, Chapter 4, Exercise 4.2 question 3 has the wrong answer."
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[#14142b] outline-none focus:border-[#5b33d6]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#14142b] mb-1.5">Page link (optional)</label>
            <input
              type="text"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="Paste the address of the page with the problem"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[#14142b] outline-none focus:border-[#5b33d6]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#14142b] mb-1.5">Your email (optional, so we can reply)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[#14142b] outline-none focus:border-[#5b33d6]"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon rounded-xl px-6 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send report"}
          </button>
        </form>
      </div>
    </div>
  );
}
