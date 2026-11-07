"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChapterPicker from "@/components/ChapterPicker";
import { MCQ_COURSE_SLUGS, parseTimeLimit } from "@/lib/mcq-shared";
import { errorText, inputClass, labelClass, primaryButton } from "../../ui";

export default function NewTestForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const timeLimitMin = parseTimeLimit(timeLimit);
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!chapterId) {
      setError("Please choose a chapter.");
      return;
    }
    if (timeLimitMin === "invalid") {
      setError("Time limit must be a whole number of minutes from 1 to 300, or empty for untimed.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/mcq/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, chapterId, timeLimitMin, isPublished: false }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaving(false);
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    router.push(`/admin/mcq/tests/${data.test.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6 flex flex-col gap-5">
      <div>
        <label htmlFor="test-title" className={labelClass}>
          Title
        </label>
        <input
          id="test-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="e.g. Straight Lines practice test 1"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="test-description" className={labelClass}>
          Description (optional, shown to students before they start)
        </label>
        <textarea
          id="test-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={1000}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="test-time" className={labelClass}>
          Time limit in minutes (leave empty for untimed)
        </label>
        <input
          id="test-time"
          type="number"
          inputMode="numeric"
          min={1}
          max={300}
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          className={`${inputClass} max-w-[180px]`}
        />
      </div>
      <ChapterPicker
        rootSlugs={MCQ_COURSE_SLUGS}
        inputClass={inputClass}
        labelClass={labelClass}
        onChange={(id) => setChapterId(id)}
      />
      {error && (
        <p role="alert" className={errorText}>
          {error}
        </p>
      )}
      <div>
        <button type="submit" disabled={saving} className={primaryButton}>
          {saving ? "Creating..." : "Create draft test"}
        </button>
      </div>
    </form>
  );
}
