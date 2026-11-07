"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChapterPicker from "@/components/ChapterPicker";
import type { AdminQuestion } from "@/lib/mcq";
import { MCQ_COURSE_SLUGS, MCQ_OPTIONS, chapterLabel, type McqChapter } from "@/lib/mcq-shared";
import QuestionForm from "../QuestionForm";
import {
  badgeDraft,
  badgeInfo,
  dangerButton,
  errorText,
  focusRing,
  inputClass,
  labelClass,
  mutedText,
  primaryButton,
  rowButton,
  rowDangerButton,
  secondaryButton,
} from "../ui";

export default function QuestionBank({
  chapter,
  invalidChapter,
  questions: initial,
}: {
  chapter: McqChapter | null;
  invalidChapter: boolean;
  questions: AdminQuestion[];
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initial);
  const [showInactive, setShowInactive] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = questions.filter((q) => showInactive || q.isActive);
  const inactiveCount = questions.filter((q) => !q.isActive).length;
  const activeCount = questions.length - inactiveCount;

  function replace(updated: AdminQuestion) {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }

  async function toggleActive(q: AdminQuestion) {
    setError("");
    const res = await fetch(`/api/admin/mcq/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !q.isActive }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not update the question.");
      return;
    }
    replace(data.question);
  }

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/admin/mcq/questions/${id}`, { method: "DELETE" });
    setConfirmDeleteId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete the question.");
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Chapter" className="card p-5 sm:p-6 flex flex-col gap-4">
        {chapter ? (
          <p className="text-[#14142b]">
            <span className="font-bold">Chapter:</span> {chapterLabel(chapter)}
          </p>
        ) : invalidChapter ? (
          <p role="alert" className={errorText}>
            That isn&apos;t a chapter in CBSE, ICSE or Competitive. Please choose another.
          </p>
        ) : (
          <p className={mutedText}>Choose a chapter to see its questions.</p>
        )}
        <ChapterPicker
          rootSlugs={MCQ_COURSE_SLUGS}
          inputClass={inputClass}
          labelClass={labelClass}
          onChange={(id) => {
            if (id) router.push(`/admin/mcq/questions?chapterId=${id}`);
          }}
        />
      </section>

      {chapter && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={mutedText}>
              {activeCount} active question{activeCount === 1 ? "" : "s"}
              {inactiveCount > 0 && `, ${inactiveCount} deactivated`}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {inactiveCount > 0 && (
                <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[#14142b]">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className={`h-5 w-5 accent-[#6d28d9] ${focusRing}`}
                  />
                  Show deactivated
                </label>
              )}
              <Link href={`/admin/mcq/import?chapterId=${chapter.id}`} className={secondaryButton}>
                Import from Excel or CSV
              </Link>
              {!adding && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(true);
                    setEditingId(null);
                  }}
                  className={primaryButton}
                >
                  Add question
                </button>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className={errorText}>
              {error}
            </p>
          )}

          {adding && (
            <QuestionForm
              chapterId={chapter.id}
              onSaved={(q) => {
                setQuestions((prev) => [...prev, q]);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          )}

          {visible.length === 0 && !adding && (
            <div className="card p-5 sm:p-6">
              <p className="text-[#3b3a55]">No questions in this chapter yet. Add the first one.</p>
            </div>
          )}

          <ol className="flex flex-col gap-4">
            {visible.map((q, i) =>
              editingId === q.id ? (
                <li key={q.id}>
                  <QuestionForm
                    chapterId={chapter.id}
                    question={q}
                    onSaved={(updated) => {
                      replace(updated);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={q.id} className={`card p-5 sm:p-6 ${q.isActive ? "" : "bg-[#f6f5fb]"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="flex-1 min-w-[200px] whitespace-pre-line font-semibold text-[#14142b]">
                      {i + 1}. {q.text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {!q.isActive && <span className={badgeDraft}>Deactivated</span>}
                      <span className={badgeInfo}>
                        {q.usedInTests === 0
                          ? "Not in any test"
                          : `In ${q.usedInTests} test${q.usedInTests === 1 ? "" : "s"}, ${q.usedInPublished} published`}
                      </span>
                    </div>
                  </div>

                  {q.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- R2 URL, not in next/image config
                    <img src={q.imageUrl} alt="" className="mt-3 max-h-40 rounded-xl border border-[#e4e2ef]" />
                  )}

                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                    {MCQ_OPTIONS.map((o) => {
                      const isCorrect = q.correctOption === o;
                      return (
                        <li
                          key={o}
                          className={`rounded-xl px-3 py-2 ${
                            isCorrect ? "pastel-mint font-semibold" : "bg-[#f6f5fb] text-[#14142b]"
                          }`}
                        >
                          {o}. {q[`option${o}`]}
                          {isCorrect && <span className="sr-only"> (correct)</span>}
                          {isCorrect && <span aria-hidden="true"> ✓</span>}
                        </li>
                      );
                    })}
                  </ul>

                  {q.explanation && (
                    <p className="mt-3 whitespace-pre-line text-sm text-[#3b3a55]">
                      <span className="font-semibold text-[#14142b]">Explanation:</span> {q.explanation}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(q.id);
                        setAdding(false);
                      }}
                      className={rowButton}
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleActive(q)} className={rowButton}>
                      {q.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                    {q.usedInTests === 0 &&
                      q.answerCount === 0 &&
                      (confirmDeleteId === q.id ? (
                        <>
                          <button type="button" onClick={() => handleDelete(q.id)} className={dangerButton}>
                            Yes, delete permanently
                          </button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className={rowButton}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setConfirmDeleteId(q.id)} className={rowDangerButton}>
                          Delete
                        </button>
                      ))}
                  </div>
                </li>
              )
            )}
          </ol>
        </>
      )}
    </div>
  );
}
