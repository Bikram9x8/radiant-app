"use client";

import { useState } from "react";
import type { AdminQuestion } from "@/lib/mcq";
import {
  MCQ_OPTIONS,
  QUESTION_IMAGE_MAX_BYTES,
  QUESTION_LIMITS,
  type McqOptionKey,
} from "@/lib/mcq-shared";
import {
  errorText,
  focusRing,
  inputClass,
  labelClass,
  primaryButton,
  questionText,
  rowDangerButton,
  secondaryButton,
} from "./ui";

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
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6 flex flex-col gap-5">
      <h3 className="text-lg font-bold text-[#14142b]">{question ? "Edit question" : "New question"}</h3>

      {question && question.usedInPublished > 0 && (
        <p className="pastel-yellow rounded-xl px-4 py-3 text-sm font-semibold">
          This question is in {question.usedInPublished} published test
          {question.usedInPublished === 1 ? "" : "s"}. Changes apply to future attempts; past scores stay as they
          were.
        </p>
      )}

      <div>
        <label htmlFor="mcq-text" className={labelClass}>
          Question
        </label>
        <textarea
          id="mcq-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={QUESTION_LIMITS.text}
          className={`${inputClass} ${questionText}`}
        />
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className={labelClass}>Options (select the correct one)</legend>
        {MCQ_OPTIONS.map((o) => (
          <div key={o} className="flex items-center gap-3">
            <input
              type="radio"
              name="mcq-correct"
              id={`mcq-correct-${o}`}
              checked={correct === o}
              onChange={() => setCorrect(o)}
              className={`h-5 w-5 shrink-0 accent-[#6d28d9] ${focusRing}`}
              aria-label={`Option ${o} is correct`}
            />
            <label htmlFor={`mcq-option-${o}`} className="w-5 shrink-0 text-sm font-bold text-[#14142b]">
              {o}
            </label>
            <input
              id={`mcq-option-${o}`}
              type="text"
              value={options[o]}
              onChange={(e) => setOptions((prev) => ({ ...prev, [o]: e.target.value }))}
              maxLength={QUESTION_LIMITS.option}
              className={`${inputClass} ${questionText}`}
            />
          </div>
        ))}
      </fieldset>

      <div>
        <label htmlFor="mcq-explanation" className={labelClass}>
          Explanation (optional, shown after submitting)
        </label>
        <textarea
          id="mcq-explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          maxLength={QUESTION_LIMITS.explanation}
          className={`${inputClass} ${questionText}`}
        />
      </div>

      <div>
        <label htmlFor="mcq-image" className={labelClass}>
          Image (optional: PNG, JPG, WebP or GIF, up to 2 MB)
        </label>
        {imageUrl ? (
          <div className="flex flex-wrap items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 URL, not in next/image config */}
            <img src={imageUrl} alt="Question image preview" className="max-h-40 rounded-xl border border-[#e4e2ef]" />
            <button type="button" onClick={() => setImageUrl(null)} className={rowDangerButton}>
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
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#f6f5fb] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#6d28d9]`}
          />
        )}
        {uploading && <p className="mt-1.5 text-sm text-[#3b3a55]">Uploading image...</p>}
      </div>

      {error && (
        <p role="alert" className={errorText}>
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving || uploading} className={primaryButton}>
          {saving ? "Saving..." : question ? "Save changes" : "Add question"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
      </div>
    </form>
  );
}
