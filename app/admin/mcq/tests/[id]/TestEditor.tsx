"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChapterPicker from "@/components/ChapterPicker";
import type { AdminQuestion } from "@/lib/mcq";
import { MCQ_COURSE_SLUGS, chapterLabel, parseTimeLimit, type McqChapter } from "@/lib/mcq-shared";
import QuestionForm from "../../QuestionForm";
import {
  badgeDraft,
  badgePublished,
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
  sectionTitle,
  successText,
} from "../../ui";

type EditorTest = {
  id: string;
  title: string;
  description: string | null;
  chapterId: string;
  timeLimitMin: number | null;
  isPublished: boolean;
  attempts: number;
};

type Message = { kind: "ok" | "error"; text: string } | null;

function MessageLine({ message }: { message: Message }) {
  if (!message) return null;
  return message.kind === "ok" ? (
    <p role="status" className={successText}>
      {message.text}
    </p>
  ) : (
    <p role="alert" className={errorText}>
      {message.text}
    </p>
  );
}

export default function TestEditor({
  test,
  chapter,
  questions: initialQuestions,
  bank: initialBank,
}: {
  test: EditorTest;
  chapter: McqChapter | null;
  questions: AdminQuestion[];
  bank: AdminQuestion[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(test.title);
  const [description, setDescription] = useState(test.description ?? "");
  const [timeLimit, setTimeLimit] = useState(test.timeLimitMin ? String(test.timeLimitMin) : "");
  const [newChapterId, setNewChapterId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(test.isPublished);

  const [list, setList] = useState(initialQuestions);
  const [savedIds, setSavedIds] = useState(initialQuestions.map((q) => q.id));
  const [bank, setBank] = useState(initialBank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [busy, setBusy] = useState(""); // the action currently running
  const [detailsMsg, setDetailsMsg] = useState<Message>(null);
  const [listMsg, setListMsg] = useState<Message>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = list.map((q) => q.id).join(",") !== savedIds.join(",");
  const activeCount = list.filter((q) => q.isActive).length;
  const available = bank.filter((b) => b.isActive && !list.some((q) => q.id === b.id));
  const canChangeChapter = list.length === 0 && savedIds.length === 0;

  // Sends details plus the given publish state; returns true on success
  async function putTest(publish: boolean, action: string): Promise<boolean> {
    setDetailsMsg(null);
    const timeLimitMin = parseTimeLimit(timeLimit);
    if (!title.trim()) {
      setDetailsMsg({ kind: "error", text: "Please enter a title." });
      return false;
    }
    if (timeLimitMin === "invalid") {
      setDetailsMsg({
        kind: "error",
        text: "Time limit must be a whole number of minutes from 1 to 300, or empty for untimed.",
      });
      return false;
    }
    const chapterId = newChapterId ?? test.chapterId;

    setBusy(action);
    const res = await fetch(`/api/admin/mcq/tests/${test.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, chapterId, timeLimitMin, isPublished: publish }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setDetailsMsg({ kind: "error", text: data.error || "Something went wrong. Please try again." });
      return false;
    }
    setIsPublished(data.test.isPublished);
    // A new chapter means a different question bank: reload the page data
    if (chapterId !== test.chapterId) router.refresh();
    return true;
  }

  async function saveDetails() {
    if (await putTest(isPublished, "details")) setDetailsMsg({ kind: "ok", text: "Details saved." });
  }

  async function togglePublish() {
    if (dirty) {
      setDetailsMsg({ kind: "error", text: "Save the question order first." });
      return;
    }
    if (!isPublished && activeCount === 0) {
      setDetailsMsg({ kind: "error", text: "Add at least one active question before publishing." });
      return;
    }
    const publishing = !isPublished;
    if (await putTest(publishing, "publish")) {
      setDetailsMsg({
        kind: "ok",
        text: publishing ? "Published. Details were saved too." : "Unpublished. Students can no longer start it.",
      });
    }
  }

  async function saveOrder() {
    setListMsg(null);
    const ids = list.map((q) => q.id);
    setBusy("order");
    const res = await fetch(`/api/admin/mcq/tests/${test.id}/questions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds: ids }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setListMsg({ kind: "error", text: data.error || "Could not save the questions." });
      return;
    }
    setSavedIds(ids);
    setListMsg({ kind: "ok", text: `Saved ${ids.length} question${ids.length === 1 ? "" : "s"}.` });
  }

  async function deleteTest() {
    setDetailsMsg(null);
    setBusy("delete");
    const res = await fetch(`/api/admin/mcq/tests/${test.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    setConfirmDelete(false);
    if (!res.ok) {
      setDetailsMsg({ kind: "error", text: data.error || "Could not delete the test." });
      return;
    }
    router.push("/admin/mcq");
    router.refresh();
  }

  function move(index: number, delta: -1 | 1) {
    setList((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function replaceQuestion(updated: AdminQuestion) {
    setList((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setBank((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Details and publishing ---------- */}
      <section className="card p-5 sm:p-6 flex flex-col gap-5" aria-labelledby="details-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="details-heading" className={sectionTitle}>
            Details
          </h2>
          <span className={isPublished ? badgePublished : badgeDraft}>{isPublished ? "Published" : "Draft"}</span>
        </div>

        <p className="text-[#14142b]">
          <span className="font-bold">Chapter:</span>{" "}
          {chapter ? chapterLabel(chapter) : "This chapter is no longer available."}
        </p>
        {canChangeChapter && (
          <div className="rounded-xl bg-[#f6f5fb] p-4 flex flex-col gap-3">
            <p className={mutedText}>
              You can change the chapter while the test has no questions. Choose one, then save details.
            </p>
            <ChapterPicker
              rootSlugs={MCQ_COURSE_SLUGS}
              inputClass={inputClass}
              labelClass={labelClass}
              onChange={(id) => setNewChapterId(id)}
            />
          </div>
        )}

        <div>
          <label htmlFor="edit-title" className={labelClass}>
            Title
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-description" className={labelClass}>
            Description (optional, shown to students before they start)
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={1000}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="edit-time" className={labelClass}>
            Time limit in minutes (leave empty for untimed)
          </label>
          <input
            id="edit-time"
            type="number"
            inputMode="numeric"
            min={1}
            max={300}
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className={`${inputClass} max-w-[180px]`}
          />
        </div>

        <MessageLine message={detailsMsg} />

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={saveDetails} disabled={!!busy} className={secondaryButton}>
            {busy === "details" ? "Saving..." : "Save details"}
          </button>
          <button type="button" onClick={togglePublish} disabled={!!busy} className={primaryButton}>
            {busy === "publish" ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </section>

      {/* ---------- Questions in this test ---------- */}
      <section className="card p-5 sm:p-6 flex flex-col gap-4" aria-labelledby="questions-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="questions-heading" className={sectionTitle}>
              Questions in this test
            </h2>
            <p className={`${mutedText} mt-0.5`}>
              {activeCount} active
              {list.length > activeCount ? `, ${list.length - activeCount} deactivated` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {dirty && <span className="pastel-yellow rounded-full px-2.5 py-0.5 text-xs font-semibold">Unsaved changes</span>}
            <button type="button" onClick={saveOrder} disabled={!dirty || !!busy} className={primaryButton}>
              {busy === "order" ? "Saving..." : "Save order"}
            </button>
          </div>
        </div>
        <MessageLine message={listMsg} />

        {list.length === 0 ? (
          <p className="text-[#3b3a55]">No questions yet. Add them from the question bank below, or write a new one.</p>
        ) : (
          <ol className="divide-y divide-[#e4e2ef]">
            {list.map((q, i) =>
              editingId === q.id && chapter ? (
                <li key={q.id} className="py-4">
                  <QuestionForm
                    chapterId={chapter.id}
                    question={q}
                    onSaved={(updated) => {
                      replaceQuestion(updated);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={q.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <p className={`whitespace-pre-line font-semibold ${q.isActive ? "text-[#14142b]" : "text-[#3b3a55]"}`}>
                        {i + 1}. {q.text}
                      </p>
                      <p className={`${mutedText} mt-1`}>
                        Answer {q.correctOption}: {q[`option${q.correctOption}`]}
                        {q.imageUrl && ". Has an image"}
                      </p>
                      {!q.isActive && (
                        <span className={`${badgeDraft} mt-2`}>Deactivated, won&apos;t appear in the test</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move question ${i + 1} up`}
                        className={rowButton}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === list.length - 1}
                        aria-label={`Move question ${i + 1} down`}
                        className={rowButton}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(q.id);
                          setAdding(false);
                        }}
                        disabled={!chapter}
                        className={rowButton}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setList((prev) => prev.filter((x) => x.id !== q.id))}
                        className={rowDangerButton}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              )
            )}
          </ol>
        )}
      </section>

      {/* ---------- Add questions ---------- */}
      {chapter && (
        <section className="card p-5 sm:p-6 flex flex-col gap-4" aria-labelledby="add-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="add-heading" className={sectionTitle}>
              Add from the question bank
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/mcq/questions?chapterId=${chapter.id}`} className={secondaryButton}>
                Open question bank
              </Link>
              {!adding && (
                <button
                  type="button"
                  onClick={() => {
                    setAdding(true);
                    setEditingId(null);
                  }}
                  className={secondaryButton}
                >
                  Write a new question
                </button>
              )}
            </div>
          </div>

          {adding && (
            <QuestionForm
              chapterId={chapter.id}
              onSaved={(q) => {
                setBank((prev) => [...prev, q]);
                setList((prev) => [...prev, q]);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          )}

          {available.length === 0 ? (
            <p className="text-[#3b3a55]">Every active question in this chapter is already in the test.</p>
          ) : (
            <ul className="divide-y divide-[#e4e2ef]">
              {available.map((q) => (
                <li key={q.id} className="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3">
                  <p className="flex-1 min-w-[200px] whitespace-pre-line text-[#14142b]">{q.text}</p>
                  <button
                    type="button"
                    onClick={() => setList((prev) => [...prev, q])}
                    className={`inline-flex min-h-[36px] items-center rounded-lg bg-[#6d28d9] px-3 text-sm font-semibold text-white hover:bg-[#5b21b6] ${focusRing}`}
                  >
                    Add to test
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ---------- Delete ---------- */}
      <section className="border-t border-[#e4e2ef] pt-5" aria-label="Delete test">
        {test.attempts > 0 ? (
          <p className={mutedText}>
            Students have taken this test {test.attempts} time{test.attempts === 1 ? "" : "s"}, so it can&apos;t be
            deleted. Unpublish it instead.
          </p>
        ) : confirmDelete ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-red-700">
              This deletes the test and its question list. The questions stay in the question bank.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={deleteTest} disabled={!!busy} className={dangerButton}>
                {busy === "delete" ? "Deleting..." : "Yes, delete test"}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className={secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={`rounded text-sm font-semibold text-red-700 hover:underline ${focusRing}`}
          >
            Delete this test
          </button>
        )}
      </section>
    </div>
  );
}
