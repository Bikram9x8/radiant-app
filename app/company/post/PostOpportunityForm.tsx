"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

const inputClass =
  "w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500";
const labelClass = "block text-sm font-medium mb-1 text-zinc-900 dark:text-white";

export default function PostOpportunityForm({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const [type, setType] = useState("QUIZ");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [applyDeadline, setApplyDeadline] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("Online");
  const [stipendOrPrize, setStipendOrPrize] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isQuiz = type === "QUIZ";
  const showEventDate = type === "EVENT" || type === "HACKATHON";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const categoryId = formData.get("categoryId") as string;

    if (!title || !categoryId || !description || !applyDeadline) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isQuiz && !externalLink) {
      setError("Please provide the test link.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        type,
        categoryId,
        description,
        eligibility: isQuiz ? null : eligibility || null,
        location: isQuiz ? null : location || null,
        mode: isQuiz ? "Online" : mode,
        stipendOrPrize: isQuiz ? null : stipendOrPrize || null,
        applyDeadline,
        eventDate: showEventDate && eventDate ? eventDate : null,
        externalLink: externalLink || null,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (success) {
    return (
      <div className="glass rounded-2xl p-6 text-emerald-700 dark:text-emerald-300">
        <p className="font-semibold">Submitted for admin approval.</p>
        <p className="text-sm mt-1">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-5">
      <div>
        <label className={labelClass}>Type *</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          <option value="QUIZ">Quiz / Test</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="JOB">Job</option>
          <option value="COMPETITION">Competition</option>
          <option value="HACKATHON">Hackathon</option>
          <option value="EVENT">Event</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Category *</label>
        <select name="categoryId" defaultValue="" className={inputClass}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{isQuiz ? "Test Title *" : "Title *"}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isQuiz ? "e.g. Class 12 Physics Mock Test 1" : "e.g. Frontend Developer Intern"}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{isQuiz ? "Test Description *" : "Description *"}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={isQuiz ? "What topics does this test cover?" : "Describe the role/opportunity"}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{isQuiz ? "Test Link *" : "External Link (optional)"}</label>
        <input
          type="url"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
        {isQuiz && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Link to the Google Form, PDF, or external site where students take the test.
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>{isQuiz ? "Available Until *" : "Apply Deadline *"}</label>
        <input
          type="date"
          value={applyDeadline}
          onChange={(e) => setApplyDeadline(e.target.value)}
          className={inputClass}
        />
      </div>

      {showEventDate && (
        <div>
          <label className={labelClass}>Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {!isQuiz && (
        <>
          <div>
            <label className={labelClass}>Eligibility</label>
            <input
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. Final year students"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / Bangalore"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass}>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Stipend / Prize</label>
            <input
              type="text"
              value={stipendOrPrize}
              onChange={(e) => setStipendOrPrize(e.target.value)}
              placeholder="e.g. 15000/month"
              className={inputClass}
            />
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl px-5 py-2.5 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit for Approval"}
      </button>
    </form>
  );
}
