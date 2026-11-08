"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconCheck, IconClockHour4, IconLayoutGrid, IconX } from "@tabler/icons-react";
import type { PublicQuestion, ReviewQuestion } from "@/lib/mcq";
import { MCQ_OPTIONS, type McqOptionKey } from "@/lib/mcq-shared";
import { withReturnTo } from "@/lib/return-to";
import {
  errorText,
  focusRing,
  mutedText,
  primaryButton,
  questionText,
  secondaryButton,
} from "@/components/mcq/ui";

type TestInfo = { id: string; title: string; description: string | null; timeLimitMin: number | null };
type Viewer = "guest" | "student" | "other";
type Result = {
  score: number;
  total: number;
  timeTakenSec: number;
  isLate: boolean;
  saved: boolean;
  viewer: Viewer;
  review: ReviewQuestion[];
};

// mm:ss, or h:mm:ss for long tests
function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  return h > 0 ? `${h}:${mm}:${String(s).padStart(2, "0")}` : `${mm}:${String(s).padStart(2, "0")}`;
}

function duration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
}

export default function TestRunner({
  test,
  questions,
  chapter,
  viewer,
}: {
  test: TestInfo;
  questions: PublicQuestion[];
  chapter: { label: string; path: string } | null;
  viewer: Viewer;
}) {
  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, McqOptionKey>>({});
  const [token, setToken] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [offset, setOffset] = useState(0); // server clock minus this device's clock
  const [now, setNow] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const submittingRef = useRef(false);
  const autoSubmitted = useRef(false);

  const limitMs = test.timeLimitMin ? test.timeLimitMin * 60_000 : null;
  const elapsedMs = Math.max(0, now + offset - startedAt);
  const remainingMs = limitMs !== null ? limitMs - elapsedMs : null;
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const unanswered = questions.length - answeredCount;
  const question = questions[index];
  const returnTo = `/tests/${test.id}`;

  async function start() {
    setError("");
    setStarting(true);
    const res = await fetch(`/api/mcq/tests/${test.id}/start`, { method: "POST" }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setStarting(false);
    if (!res || !res.ok) {
      setError(res ? data.error || "The test couldn't be started." : "Couldn't connect. Check your internet and try again.");
      return;
    }
    autoSubmitted.current = false;
    setToken(data.token);
    setStartedAt(data.startedAt);
    setOffset(data.serverNow - Date.now());
    setNow(Date.now());
    setAnswers({});
    setIndex(0);
    setResult(null);
    setConfirmOpen(false);
    setNavOpen(false);
    setPhase("running");
    window.scrollTo({ top: 0 });
  }

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    setConfirmOpen(false);
    const res = await fetch(`/api/mcq/tests/${test.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    submittingRef.current = false;
    setSubmitting(false);
    if (!res || !res.ok) {
      setError(
        res ? data.error || "The test couldn't be submitted." : "Couldn't submit. Check your internet and try again."
      );
      return;
    }
    setResult(data);
    setPhase("result");
    window.scrollTo({ top: 0 });
  }, [test.id, token, answers]);

  // Keep the latest submit for the timer
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // Clock tick; submits automatically when time runs out
  useEffect(() => {
    if (phase !== "running") return;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (limitMs !== null && !autoSubmitted.current && t + offset - startedAt >= limitMs) {
        autoSubmitted.current = true;
        void submitRef.current();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, limitMs, offset, startedAt]);

  // Leaving mid-test loses the answers (no resume), so the browser asks first
  useEffect(() => {
    if (phase !== "running") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  // New question: move focus to its text so screen readers and keyboards start there
  useEffect(() => {
    if (phase === "running") headingRef.current?.focus({ preventScroll: true });
  }, [index, phase]);

  const choose = useCallback(
    (option: McqOptionKey) => {
      if (!question) return;
      setAnswers((prev) => ({ ...prev, [question.id]: option }));
    },
    [question]
  );

  function clearAnswer() {
    if (!question) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
  }

  function go(to: number) {
    setIndex(Math.max(0, Math.min(questions.length - 1, to)));
    setConfirmOpen(false);
    window.scrollTo({ top: 0 });
  }

  function finish() {
    if (unanswered > 0) setConfirmOpen(true);
    else void submit();
  }

  // Desktop shortcuts: 1-4 or A-D pick an option, arrow keys move between questions
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || submittingRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || (target.tagName === "INPUT" && (target as HTMLInputElement).type !== "radio"))) return;
      const key = e.key.toUpperCase();
      const pick = ["1", "2", "3", "4"].indexOf(key) >= 0 ? MCQ_OPTIONS[Number(key) - 1] : (MCQ_OPTIONS as readonly string[]).includes(key) ? (key as McqOptionKey) : null;
      if (pick) {
        choose(pick);
      } else if (e.key === "ArrowRight" && target?.tagName !== "INPUT") {
        setIndex((i) => Math.min(questions.length - 1, i + 1));
      } else if (e.key === "ArrowLeft" && target?.tagName !== "INPUT") {
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose, questions.length]);

  // ======================= INTRO =======================
  if (phase === "intro") {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {chapter && (
          <Link href={chapter.path} className={`rounded text-sm font-semibold text-[#6d28d9] hover:underline ${focusRing}`}>
            ← {chapter.label}
          </Link>
        )}
        <section className="pastel-purple mt-4 rounded-[16px] px-5 py-6 sm:px-8 sm:py-8">
          <h1 className={`${questionText} text-2xl sm:text-4xl font-extrabold tracking-tight text-[#14142b]`}>{test.title}</h1>
          {test.description && (
            <p className={`${questionText} mt-3 max-w-prose whitespace-pre-line text-[#3b3a55]`}>{test.description}</p>
          )}
          <ul className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-[#14142b]">
            <li className="rounded-full bg-white px-3 py-1.5">
              {questions.length} question{questions.length === 1 ? "" : "s"}
            </li>
            <li className="rounded-full bg-white px-3 py-1.5">
              {test.timeLimitMin ? `${test.timeLimitMin} minutes` : "No time limit"}
            </li>
          </ul>
        </section>

        <section className="card mt-4 p-5 sm:p-6" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-lg font-bold text-[#14142b]">
            Before you start
          </h2>
          <ul className="mt-3 flex flex-col gap-2 text-[#3b3a55]">
            <li>One question at a time. You can go back and change answers before you submit.</li>
            {test.timeLimitMin && <li>The timer starts when you press Start. When it reaches zero, the test is submitted.</li>}
            <li>If you leave or reload the page, the test starts again.</li>
            <li>You&apos;ll see your score and the correct answers straight after submitting.</li>
          </ul>
          <p className={`${mutedText} mt-4`}>
            {viewer === "student"
              ? "Your score will be saved to your progress."
              : viewer === "other"
                ? "You can try this test, but only student accounts save attempts."
                : "You're not logged in, so your score won't be saved."}
            {viewer === "guest" && (
              <>
                {" "}
                <Link href={withReturnTo("/login", returnTo)} className={`rounded font-semibold text-[#6d28d9] hover:underline ${focusRing}`}>
                  Log in
                </Link>{" "}
                to save it.
              </>
            )}
          </p>
          {error && (
            <p role="alert" className={`${errorText} mt-4`}>
              {error}
            </p>
          )}
          <button type="button" onClick={start} disabled={starting} className={`${primaryButton} mt-5 w-full sm:w-auto min-h-[52px] px-8 text-base`}>
            {starting ? "Starting..." : "Start test"}
          </button>
        </section>
      </div>
    );
  }

  // ======================= RESULT =======================
  if (phase === "result" && result) {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <section className="pastel-purple rounded-[16px] px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="score-heading">
          <h1 id="score-heading" className="text-lg font-bold text-[#14142b]">
            Your score
          </h1>
          <p className="mt-1 text-5xl sm:text-6xl font-extrabold tracking-tight text-[#14142b]" role="status">
            {result.score} / {result.total}
          </p>
          <p className="mt-2 text-[#3b3a55]">
            {percent}% correct, in {duration(result.timeTakenSec)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            {result.isLate && (
              <span className="pastel-peach rounded-full px-3 py-1.5">Submitted after the time limit</span>
            )}
            {result.saved && (
              <span className="pastel-mint inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                <IconCheck size={16} stroke={2.5} aria-hidden="true" />
                Saved to your progress
              </span>
            )}
            {result.viewer === "other" && (
              <span className="rounded-full bg-white px-3 py-1.5 text-[#3b3a55]">
                Not saved: only student accounts save attempts
              </span>
            )}
          </div>
        </section>

        {result.viewer === "guest" && (
          <section className="card mt-4 p-5 sm:p-6" aria-labelledby="save-heading">
            <h2 id="save-heading" className="text-lg font-bold text-[#14142b]">
              Sign up to save your progress
            </h2>
            <p className="mt-1 text-[#3b3a55]">
              With a free student account, every attempt is saved and you can see which chapters to revise.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={withReturnTo("/signup", returnTo)} className={primaryButton}>
                Sign up free
              </Link>
              <Link href={withReturnTo("/login", returnTo)} className={secondaryButton}>
                Log in
              </Link>
            </div>
          </section>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={start} disabled={starting} className={primaryButton}>
            {starting ? "Starting..." : "Retake test"}
          </button>
          {chapter && (
            <Link href={chapter.path} className={secondaryButton}>
              Back to chapter
            </Link>
          )}
        </div>
        {error && (
          <p role="alert" className={`${errorText} mt-3`}>
            {error}
          </p>
        )}

        <h2 className="mt-8 text-lg font-bold text-[#14142b]">Answers</h2>
        <ol className="mt-3 flex flex-col gap-4">
          {result.review.map((q, i) => (
            <li key={q.id} className="card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <p className={`${questionText} font-semibold text-[#14142b] whitespace-pre-line`}>
                  {i + 1}. {q.text}
                </p>
                <span
                  className={`shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    q.isCorrect ? "pastel-mint" : "bg-white border border-red-700 text-red-700"
                  }`}
                >
                  {q.isCorrect ? <IconCheck size={18} stroke={2.5} aria-hidden="true" /> : <IconX size={18} stroke={2.5} aria-hidden="true" />}
                  <span className="sr-only">{q.isCorrect ? "Correct" : q.selected ? "Wrong" : "Not answered"}</span>
                </span>
              </div>
              {q.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- R2 URL, not in next/image config
                <img src={q.imageUrl} alt={`Image for question ${i + 1}`} loading="lazy" className="mt-3 max-h-64 w-auto max-w-full rounded-xl border border-[#e4e2ef]" />
              )}
              <ul className="mt-3 flex flex-col gap-2">
                {MCQ_OPTIONS.map((o) => {
                  const isCorrect = q.correctOption === o;
                  const isPicked = q.selected === o;
                  return (
                    <li
                      key={o}
                      className={`flex items-start gap-3 rounded-xl px-3 py-2 ${
                        isCorrect
                          ? "pastel-mint"
                          : isPicked
                            ? "border border-red-700 bg-white text-red-700"
                            : "bg-[#f6f5fb] text-[#14142b]"
                      }`}
                    >
                      <span className="font-bold">{o}.</span>
                      <span className={`${questionText} flex-1`}>{q.options[o]}</span>
                      {isCorrect && <span className="text-xs font-semibold">Correct answer</span>}
                      {isPicked && !isCorrect && <span className="text-xs font-semibold">Your answer</span>}
                    </li>
                  );
                })}
              </ul>
              {!q.selected && <p className={`${mutedText} mt-2`}>Not answered</p>}
              {q.explanation && (
                <p className={`${questionText} mt-3 whitespace-pre-line text-sm text-[#3b3a55]`}>
                  <span className="font-semibold text-[#14142b]">Explanation:</span> {q.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // ======================= RUNNING =======================
  if (!question) return null;
  const selected = answers[question.id];
  const isLast = index === questions.length - 1;
  const lastMinute = remainingMs !== null && remainingMs <= 60_000;
  const lastFive = remainingMs !== null && remainingMs <= 300_000;
  const timeNotice = remainingMs === null ? "" : lastMinute ? "1 minute left." : lastFive ? "5 minutes left." : "";

  return (
    <div className="flex-1 w-full">
      {/* Top bar (below the site navbar) */}
      <div className="sticky top-16 z-40 border-b border-[#e4e2ef] bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className={`${questionText} min-w-0 truncate font-semibold text-[#14142b]`}>{test.title}</p>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
                lastMinute
                  ? "border border-red-700 bg-white text-red-700"
                  : lastFive
                    ? "pastel-yellow"
                    : "bg-[#f6f5fb] text-[#14142b]"
              }`}
              aria-label={remainingMs !== null ? `Time left ${clock(remainingMs)}` : `Time taken ${clock(elapsedMs)}`}
            >
              <IconClockHour4 size={16} stroke={2} aria-hidden="true" />
              {remainingMs !== null ? clock(remainingMs) : clock(elapsedMs)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className={mutedText}>
              Question {index + 1} of {questions.length}, {answeredCount} answered
            </p>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-expanded={navOpen}
              aria-controls="question-nav"
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#6d28d9] hover:bg-[#f6f5fb] ${focusRing}`}
            >
              <IconLayoutGrid size={18} stroke={2} aria-hidden="true" />
              All questions
            </button>
          </div>
          {navOpen && (
            <div id="question-nav" className="pb-2 pt-2">
              <ol className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                {questions.map((q, i) => {
                  const done = !!answers[q.id];
                  const current = i === index;
                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => {
                          go(i);
                          setNavOpen(false);
                        }}
                        aria-current={current ? "step" : undefined}
                        aria-label={`Question ${i + 1}, ${done ? "answered" : "not answered"}`}
                        className={`flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold ${
                          done ? "bg-[#6d28d9] text-white" : "border border-[#d4d4d8] bg-white text-[#14142b]"
                        } ${current ? "ring-2 ring-[#6d28d9] ring-offset-2" : ""} ${focusRing}`}
                      >
                        {i + 1}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <p className={`${mutedText} mt-2`}>Purple = answered. Tap a number to go to that question.</p>
            </div>
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {timeNotice}
      </p>

      {/* Question */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-5 pb-36">
        <h1
          ref={headingRef}
          tabIndex={-1}
          id={`q-${question.id}`}
          className={`${questionText} whitespace-pre-line text-lg sm:text-xl font-semibold text-[#14142b] outline-none`}
        >
          <span className="sr-only">Question {index + 1}: </span>
          {question.text}
        </h1>
        {question.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- R2 URL, not in next/image config
          <img src={question.imageUrl} alt={`Image for question ${index + 1}`} className="mt-4 max-h-80 w-auto max-w-full rounded-xl border border-[#e4e2ef]" />
        )}

        <div role="radiogroup" aria-labelledby={`q-${question.id}`} className="mt-5 flex flex-col gap-3">
          {MCQ_OPTIONS.map((o) => {
            const isSelected = selected === o;
            return (
              <label
                key={o}
                className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[16px] border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#6d28d9] ${
                  isSelected ? "border-[#6d28d9] bg-[#ede9fe]" : "border-[#e4e2ef] bg-white hover:border-[#c4b5fd]"
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  value={o}
                  checked={isSelected}
                  onChange={() => choose(o)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isSelected ? "bg-[#6d28d9] text-white" : "bg-[#f6f5fb] text-[#14142b]"
                  }`}
                >
                  {o}
                </span>
                <span className={`${questionText} flex-1 text-base text-[#14142b]`}>
                  <span className="sr-only">Option {o}: </span>
                  {question.options[o]}
                </span>
                {isSelected && <IconCheck size={22} stroke={2.5} className="shrink-0 text-[#6d28d9]" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
        {selected && (
          <button
            type="button"
            onClick={clearAnswer}
            className={`mt-3 inline-flex min-h-[40px] items-center rounded-lg px-2 text-sm font-semibold text-[#3b3a55] hover:text-[#6d28d9] ${focusRing}`}
          >
            Clear my answer
          </button>
        )}

        {confirmOpen && (
          <div role="alert" className="pastel-yellow mt-6 rounded-[16px] p-4 sm:p-5">
            <p className="font-semibold">
              You haven&apos;t answered {unanswered} question{unanswered === 1 ? "" : "s"}. Submit anyway?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={() => void submit()} disabled={submitting} className={primaryButton}>
                {submitting ? "Submitting..." : "Submit test"}
              </button>
              <button
                type="button"
                onClick={() => go(questions.findIndex((q) => !answers[q.id]))}
                className={secondaryButton}
              >
                Go to the first unanswered
              </button>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-6 rounded-[16px] border border-red-700 bg-white p-4 sm:p-5">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button type="button" onClick={() => void submit()} disabled={submitting} className={`${primaryButton} mt-3`}>
              {submitting ? "Submitting..." : "Try again"}
            </button>
          </div>
        )}
      </main>

      {/* Bottom bar: thumb reach on phones, clear of the iPhone home indicator */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4e2ef] bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 px-4 sm:px-6">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0 || submitting} className={`${secondaryButton} min-h-[52px] text-base`}>
            Previous
          </button>
          {isLast ? (
            <button type="button" onClick={finish} disabled={submitting} className={`${primaryButton} min-h-[52px] text-base`}>
              {submitting ? "Submitting..." : "Review and submit"}
            </button>
          ) : (
            <button type="button" onClick={() => go(index + 1)} disabled={submitting} className={`${primaryButton} min-h-[52px] text-base`}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
