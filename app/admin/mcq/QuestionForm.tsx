"use client";

import { useState } from "react";
import type { AdminQuestion } from "@/lib/mcq";
import {
  MCQ_OPTIONS,
  QUESTION_IMAGE_MAX_BYTES,
  QUESTION_LIMITS,
  type McqOptionKey,
} from "@/lib/mcq-shared";

export const mcqInputClass =
  "w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500";
export const mcqLabelClass = "block text-sm font-medium mb-1 text-zinc-900 dark:text-white";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// Add or edit one question. Without `question` it creates a new one in `chapterId`.
export default function QuestionForm({
  chapterId,
  question,
  onSaved,
  onCancel,
}: {
  chapterId: string;
  question?: AdminQuestion;
  onSaved: (question: AdminQuestion) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(question?.text ?? "");
  const [options, setOptions] = useState<Record<McqOptionKey, string>>({
    A: question?.optionA ?? "",
    B: question?.optionB ?? "",
    C: question?.optionC ?? "",
    D: question?.optionD ?? "",
  });
  const [correct, setCorrect] = useState<McqOptionKey | "">(question?.correctOption ?? "");
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(question?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleImage(file: File | null) {
    if (!file) return;
    setError("");
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Image must be PNG, JPG, WebP or GIF.");
      return;
    }
    if (file.size > QUESTION_IMAGE_MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setUploading(true);
    const urlRes = await fetch("/api/get-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });
    if (!urlRes.ok) {
      setUploading(false);
      setError("Could not prepare the image upload. Please try again.");
      return;
    }
    const { uploadUrl, publicUrl } = await urlRes.json();
    const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    setUploading(false);
    if (!putRes.ok) {
      setError("Image upload failed. Please try again.");
      return;
    }
    setImageUrl(publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!text.trim() || MCQ_OPTIONS.some((o) => !options[o].trim())) {
      setError("Please fill in the question and all four options.");
      return;
    }
    if (!correct) {
      setError("Please mark the correct option.");
      return;
    }

    setSaving(true);
    const res = await fetch(question ? `/api/admin/mcq/questions/${question.id}` : "/api/admin/mcq/questions", {
      method: question ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterId,
        text,
        optionA: options.A,
        optionB: options.B,
        optionC: options.C,
        optionD: options.D,
        correctOption: correct,
        explanation,
        imageUrl,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    const data = await res.json();
    onSaved(data.question);
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="font-semibold text-sm text-zinc-900 dark:text-white">
        {question ? "Edit question" : "New question"}
      </h2>

      {question && question.usedInPublished > 0 && (
        <p className="text-sm rounded-xl bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-3 py-2">
          This question is in {question.usedInPublished} published test
          {question.usedInPublished === 1 ? "" : "s"}. Changes apply to future attempts; past scores stay as they
          were.
        </p>
      )}

      <div>
        <label htmlFor="mcq-text" className={mcqLabelClass}>
          Question *
        </label>
        <textarea
          id="mcq-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={QUESTION_LIMITS.text}
          className={mcqInputClass}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={mcqLabelClass}>Options * (mark the correct one)</legend>
        {MCQ_OPTIONS.map((o) => (
          <div key={o} className="flex items-center gap-3">
            <input
              type="radio"
              name="mcq-correct"
              id={`mcq-correct-${o}`}
              checked={correct === o}
              onChange={() => setCorrect(o)}
              className="w-4 h-4 shrink-0"
              aria-label={`Option ${o} is correct`}
            />
            <label htmlFor={`mcq-option-${o}`} className="w-5 shrink-0 text-sm font-semibold text-zinc-900 dark:text-white">
              {o}
            </label>
            <input
              id={`mcq-option-${o}`}
              type="text"
              value={options[o]}
              onChange={(e) => setOptions((prev) => ({ ...prev, [o]: e.target.value }))}
              maxLength={QUESTION_LIMITS.option}
              className={mcqInputClass}
            />
          </div>
        ))}
      </fieldset>

      <div>
        <label htmlFor="mcq-explanation" className={mcqLabelClass}>
          Explanation (optional, shown after submitting)
        </label>
        <textarea
          id="mcq-explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          maxLength={QUESTION_LIMITS.explanation}
          className={mcqInputClass}
        />
      </div>

      <div>
        <label htmlFor="mcq-image" className={mcqLabelClass}>
          Image (optional, PNG/JPG/WebP/GIF, max 2 MB)
        </label>
        {imageUrl ? (
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 URL, not in next/image config */}
            <img src={imageUrl} alt="Question image preview" className="max-h-40 rounded-lg border border-white/30" />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="text-xs px-2 py-1 rounded-lg glass text-red-600 dark:text-red-400"
            >
              Remove image
            </button>
          </div>
        ) : (
          <input
            id="mcq-image"
            type="file"
            accept={IMAGE_TYPES.join(",")}
            onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
            disabled={uploading}
            className={mcqInputClass}
          />
        )}
        {uploading && <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Uploading image...</p>}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-neon rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : question ? "Save changes" : "Add question"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-semibold glass text-zinc-900 dark:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
