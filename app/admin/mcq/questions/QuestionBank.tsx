"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChapterPicker from "@/components/ChapterPicker";
import type { AdminQuestion, McqChapter } from "@/lib/mcq";
import { MCQ_COURSE_SLUGS, MCQ_OPTIONS } from "@/lib/mcq-shared";
import QuestionForm, { mcqInputClass, mcqLabelClass } from "../QuestionForm";

export function chapterLabel(chapter: McqChapter): string {
  const name = chapter.chapterNo ? `Ch ${chapter.chapterNo}. ${chapter.name}` : chapter.name;
  return [...chapter.trail.map((n) => n.name), name].join(" › ");
}

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
      <div className="glass rounded-2xl p-5 flex flex-col gap-3">
        {chapter ? (
          <p className="text-sm text-zinc-900 dark:text-white">
            <span className="font-semibold">Chapter:</span> {chapterLabel(chapter)}
          </p>
        ) : invalidChapter ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            That isn&apos;t a chapter in CBSE, ICSE or Competitive. Please choose another.
          </p>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Choose a chapter to see its questions.</p>
        )}
        <ChapterPicker
          rootSlugs={MCQ_COURSE_SLUGS}
          inputClass={mcqInputClass}
          labelClass={mcqLabelClass}
          onChange={(id) => {
            if (id) router.push(`/admin/mcq/questions?chapterId=${id}`);
          }}
        />
      </div>

      {chapter && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {questions.length - inactiveCount} active question{questions.length - inactiveCount === 1 ? "" : "s"}
              {inactiveCount > 0 && `, ${inactiveCount} deactivated`}
            </p>
            <div className="flex items-center gap-4">
              {inactiveCount > 0 && (
                <label className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Show deactivated
                </label>
              )}
              {!adding && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(true);
                    setEditingId(null);
                  }}
                  className="btn-neon rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  + Add question
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

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
            <p className="glass rounded-2xl p-5 text-sm text-zinc-600 dark:text-zinc-400">
              No questions in this chapter yet.
            </p>
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
                <li key={q.id} className={`glass rounded-2xl p-5 ${q.isActive ? "" : "opacity-60"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white whitespace-pre-line flex-1 min-w-[200px]">
                      {i + 1}. {q.text}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {!q.isActive && (
                        <span className="rounded-full px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          Deactivated
                        </span>
                      )}
                      <span className="rounded-full px-2 py-0.5 bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                        {q.usedInTests === 0
                          ? "Not in any test"
                          : `In ${q.usedInTests} test${q.usedInTests === 1 ? "" : "s"} (${q.usedInPublished} published)`}
                      </span>
                    </div>
                  </div>

                  {q.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- R2 URL, not in next/image config
                    <img src={q.imageUrl} alt="" className="mt-3 max-h-40 rounded-lg border border-white/30" />
                  )}

                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 text-sm">
                    {MCQ_OPTIONS.map((o) => {
                      const isCorrect = q.correctOption === o;
                      return (
                        <li
                          key={o}
                          className={`rounded-lg px-3 py-1.5 ${
                            isCorrect
                              ? "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-semibold"
                              : "bg-white/40 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {o}. {q[`option${o}`]}
                          {isCorrect && <span className="sr-only"> (correct)</span>}
                          {isCorrect && " ✓"}
                        </li>
                      );
                    })}
                  </ul>

                  {q.explanation && (
                    <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                      <span className="font-semibold">Explanation:</span> {q.explanation}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(q.id);
                        setAdding(false);
                      }}
                      className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(q)}
                      className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white"
                    >
                      {q.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                    {q.usedInTests === 0 && q.answerCount === 0 &&
                      (confirmDeleteId === q.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete(q.id)}
                            className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white"
                          >
                            Yes, delete permanently
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs px-2 py-1 rounded-lg glass text-zinc-900 dark:text-white"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(q.id)}
                          className="text-xs px-2 py-1 rounded-lg glass text-red-600 dark:text-red-400"
                        >
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
