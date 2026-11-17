"use client";

import { useState } from "react";
import { SHOW_SCHOOL } from "@/lib/features";

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
      <div className="flex-1 px-4">
        <div className="mx-auto my-10 w-full max-w-xl rounded-[18px] border border-line bg-white shadow-soft px-6 py-14 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-tint-teal text-teal-dark flex items-center justify-center text-2xl font-bold">✓</div>
          <h1 className="mt-5 font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl">Thank <span className="font-serif font-normal normal-case italic text-teal">you</span></h1>
          <p className="mt-3 text-muted">Your report has been sent. We will look into it.</p>
          <a href="/" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-teal px-6 font-bold text-white shadow-[0_8px_20px_-10px_rgb(15_118_110/0.6)] transition-colors hover:bg-teal-dark">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4">
      <div className="mx-auto my-10 w-full max-w-xl rounded-[18px] border border-line bg-white shadow-soft px-6 py-10 sm:px-10">
        <h1 className="font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl">Report a <span className="font-serif font-normal normal-case italic text-teal">problem</span></h1>
        <p className="mt-3 text-muted">Found a mistake or something not working? Tell us and we will fix it.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">What kind of problem is it?</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[46px] rounded-xl border-[1.5px] border-btn-line bg-white px-4 py-3 text-ink outline-none hover:border-[#b8c4d1] focus:border-teal focus:ring-3 focus:ring-teal/25"
            >
              <option value="">Choose one</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Describe the problem</label>
            <textarea
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                SHOW_SCHOOL
                  ? "For example: Class 10 Maths, Chapter 4, Exercise 4.2 question 3 has the wrong answer."
                  : "For example: JEE prep Physics test, question 3 has the wrong answer."
              }
              className="w-full min-h-[46px] rounded-xl border-[1.5px] border-btn-line bg-white px-4 py-3 text-ink outline-none hover:border-[#b8c4d1] focus:border-teal focus:ring-3 focus:ring-teal/25"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Page link (optional)</label>
            <input
              type="text"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="Paste the address of the page with the problem"
              className="w-full min-h-[46px] rounded-xl border-[1.5px] border-btn-line bg-white px-4 py-3 text-ink outline-none hover:border-[#b8c4d1] focus:border-teal focus:ring-3 focus:ring-teal/25"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Your email (optional, so we can reply)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full min-h-[46px] rounded-xl border-[1.5px] border-btn-line bg-white px-4 py-3 text-ink outline-none hover:border-[#b8c4d1] focus:border-teal focus:ring-3 focus:ring-teal/25"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal px-6 font-bold text-white shadow-[0_8px_20px_-10px_rgb(15_118_110/0.6)] transition-colors hover:bg-teal-dark disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send report"}
          </button>
        </form>
      </div>
    </div>
  );
}
