"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChapterPicker from "@/components/ChapterPicker";
import type { ImportRow } from "@/lib/mcq-import";
import { MCQ_COURSE_SLUGS, chapterLabel, type McqChapter } from "@/lib/mcq-shared";
import {
  badgeBase,
  badgeDraft,
  badgePublished,
  errorText,
  focusRing,
  inputClass,
  labelClass,
  mutedText,
  primaryButton,
  secondaryButton,
  sectionTitle,
  successText,
} from "../ui";

type Preview = { fingerprint: string; format: string; rows: ImportRow[] };
type Filter = "all" | "errors" | "warnings";

const STATUS: Record<ImportRow["status"], { label: string; className: string }> = {
  ready: { label: "Ready", className: badgePublished },
  warning: { label: "Warning", className: `${badgeBase} pastel-yellow` },
  error: { label: "Error", className: `${badgeBase} border border-red-700 bg-white text-red-700` },
  example: { label: "Example", className: badgeDraft },
};

export default function ImportForm({
  chapter,
  invalidChapter,
}: {
  chapter: McqChapter | null;
  invalidChapter: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [importDuplicates, setImportDuplicates] = useState(false);
  const [createTest, setCreateTest] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [busy, setBusy] = useState<"" | "check" | "import">("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ imported: number; testId: string | null } | null>(null);

  const rows = preview?.rows ?? [];
  const errors = rows.filter((r) => r.status === "error").length;
  const warnings = rows.filter((r) => r.status === "warning").length;
  const examples = rows.filter((r) => r.status === "example").length;
  const duplicates = rows.filter((r) => r.duplicate).length;
  const toImport = rows.filter(
    (r) => (r.status === "ready" || r.status === "warning") && (importDuplicates || !r.duplicate)
  ).length;
  const shown = rows.filter(
    (r) => filter === "all" || (filter === "errors" ? r.status === "error" : r.status === "warning")
  );

  function formData(mode: "preview" | "commit") {
    const fd = new FormData();
    fd.set("file", file as File);
    fd.set("chapterId", chapter?.id ?? "");
    fd.set("mode", mode);
    if (mode === "commit" && preview) {
      fd.set("fingerprint", preview.fingerprint);
      fd.set("importDuplicates", importDuplicates ? "1" : "0");
      fd.set("createTest", createTest ? "1" : "0");
      fd.set("testTitle", testTitle);
    }
    return fd;
  }

  async function checkFile() {
    setError("");
    setDone(null);
    setPreview(null);
    if (!file) {
      setError("Please choose a file.");
      return;
    }
    setBusy("check");
    const res = await fetch("/api/admin/mcq/import", { method: "POST", body: formData("preview") });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setError(data.error || "The file couldn't be checked. Please try again.");
      return;
    }
    setPreview(data);
    setFilter(data.rows.some((r: ImportRow) => r.status === "error") ? "errors" : "all");
  }

  async function runImport() {
    setError("");
    if (createTest && !testTitle.trim()) {
      setError("Please enter a title for the draft test, or untick the box.");
      return;
    }
    setBusy("import");
    const res = await fetch("/api/admin/mcq/import", { method: "POST", body: formData("commit") });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setError(data.error || "The import failed. Nothing was saved.");
      return;
    }
    setDone(data);
    setPreview(null);
    setFile(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- 1. Chapter and file ---------- */}
      <section className="card p-5 sm:p-6 flex flex-col gap-5" aria-labelledby="file-heading">
        <h2 id="file-heading" className={sectionTitle}>
          Chapter and file
        </h2>

        {chapter ? (
          <p className="text-[#14142b]">
            <span className="font-bold">Questions go into:</span> {chapterLabel(chapter)}
          </p>
        ) : invalidChapter ? (
          <p role="alert" className={errorText}>
            That isn&apos;t a chapter in CBSE, ICSE or Competitive. Please choose another.
          </p>
        ) : (
          <p className={mutedText}>Choose the chapter these questions belong to.</p>
        )}
        <ChapterPicker
          rootSlugs={MCQ_COURSE_SLUGS}
          inputClass={inputClass}
          labelClass={labelClass}
          onChange={(id) => {
            if (id) router.push(`/admin/mcq/import?chapterId=${id}`);
          }}
        />

        <div className="rounded-xl bg-[#f6f5fb] p-4 flex flex-col gap-3">
          <p className="text-sm text-[#14142b]">
            Start from the template. It has two example rows (English and Hindi) that are skipped on import. For
            Hindi and Punjabi, keep the file as .xlsx, or save CSV as “CSV UTF-8”.
          </p>
          <div className="flex flex-wrap gap-3">
            {/* Plain links with download: these are files, not pages, so next/link doesn't apply */}
            <a href="/api/admin/mcq/import/template?format=xlsx" download className={secondaryButton}>
              Download template (.xlsx)
            </a>
            <a href="/api/admin/mcq/import/template?format=csv" download className={secondaryButton}>
              Download template (.csv)
            </a>
          </div>
        </div>

        {chapter && (
          <>
            <div>
              <label htmlFor="import-file" className={labelClass}>
                Question file (.xlsx or .csv, up to 2 MB and 500 questions)
              </label>
              <input
                id="import-file"
                type="file"
                accept=".xlsx,.csv,.txt"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setPreview(null);
                  setDone(null);
                  setError("");
                }}
                className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#f6f5fb] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#6d28d9]`}
              />
            </div>
            <div>
              <button type="button" onClick={checkFile} disabled={!file || !!busy} className={primaryButton}>
                {busy === "check" ? "Checking..." : "Check file"}
              </button>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className={errorText}>
            {error}
          </p>
        )}
        {done && (
          <div role="status" className="pastel-mint rounded-xl px-4 py-3 flex flex-col gap-2">
            <p className="font-semibold">
              Imported {done.imported} question{done.imported === 1 ? "" : "s"}
              {chapter ? ` into ${chapterLabel(chapter)}` : ""}.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {chapter && (
                <Link href={`/admin/mcq/questions?chapterId=${chapter.id}`} className={`rounded font-semibold text-[#6d28d9] hover:underline ${focusRing}`}>
                  Open the question bank
                </Link>
              )}
              {done.testId && (
                <Link href={`/admin/mcq/tests/${done.testId}`} className={`rounded font-semibold text-[#6d28d9] hover:underline ${focusRing}`}>
                  Open the draft test
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ---------- 2. Preview ---------- */}
      {preview && (
        <section className="card p-5 sm:p-6 flex flex-col gap-5" aria-labelledby="preview-heading">
          <div>
            <h2 id="preview-heading" className={sectionTitle}>
              Check before importing
            </h2>
            <p className={`${mutedText} mt-1`}>
              {file?.name} ({preview.format}): {rows.length} row{rows.length === 1 ? "" : "s"}.{" "}
              {rows.length - errors - examples - warnings} ready, {warnings} with warnings, {errors} with errors
              {examples > 0 ? `, ${examples} example row${examples === 1 ? "" : "s"} skipped` : ""}.
            </p>
          </div>

          {errors > 0 ? (
            <p role="alert" className="text-sm font-semibold text-red-700">
              Fix the {errors} row{errors === 1 ? "" : "s"} with errors in your file, then choose it again and check
              it. Nothing is imported while any row has an error.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {duplicates > 0 && (
                <label className="flex min-h-[44px] items-center gap-3 text-sm font-semibold text-[#14142b]">
                  <input
                    type="checkbox"
                    checked={importDuplicates}
                    onChange={(e) => setImportDuplicates(e.target.checked)}
                    className={`h-5 w-5 accent-[#6d28d9] ${focusRing}`}
                  />
                  Import the {duplicates} duplicate{duplicates === 1 ? "" : "s"} anyway (skipped otherwise)
                </label>
              )}
              <label className="flex min-h-[44px] items-center gap-3 text-sm font-semibold text-[#14142b]">
                <input
                  type="checkbox"
                  checked={createTest}
                  onChange={(e) => setCreateTest(e.target.checked)}
                  className={`h-5 w-5 accent-[#6d28d9] ${focusRing}`}
                />
                Also create a draft test from these questions
              </label>
              {createTest && (
                <div>
                  <label htmlFor="import-test-title" className={labelClass}>
                    Draft test title
                  </label>
                  <input
                    id="import-test-title"
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runImport}
                  disabled={toImport === 0 || !!busy}
                  className={primaryButton}
                >
                  {busy === "import"
                    ? "Importing..."
                    : `Import ${toImport} question${toImport === 1 ? "" : "s"}`}
                </button>
                {toImport === 0 && <span className={mutedText}>There is nothing to import in this file.</span>}
              </div>
            </div>
          )}

          <nav aria-label="Filter rows" className="inline-flex self-start gap-1 rounded-xl bg-[#f6f5fb] p-1">
            {(
              [
                ["all", `All (${rows.length})`],
                ["errors", `Errors (${errors})`],
                ["warnings", `Warnings (${warnings})`],
              ] as [Filter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`flex min-h-[40px] items-center rounded-lg px-4 text-sm font-semibold ${
                  filter === key
                    ? "bg-white text-[#6d28d9] shadow-[0_1px_4px_rgba(20,20,43,0.12)]"
                    : "text-[#3b3a55] hover:text-[#6d28d9]"
                } ${focusRing}`}
              >
                {label}
              </button>
            ))}
          </nav>

          {shown.length === 0 ? (
            <p className={successText}>No rows to show for this filter.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#e4e2ef]">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-[#e4e2ef] bg-[#f6f5fb] text-left text-[#3b3a55]">
                    <th scope="col" className="px-4 py-3 font-semibold">Row</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Question</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Correct</th>
                    <th scope="col" className="px-4 py-3 font-semibold">What to fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2ef]">
                  {shown.map((r) => (
                    <tr key={r.rowNumber} className="align-top">
                      <td className="px-4 py-3 font-semibold text-[#14142b]">{r.rowNumber}</td>
                      <td className="px-4 py-3">
                        <span className={STATUS[r.status].className}>
                          {r.duplicate && r.status === "warning" ? "Duplicate" : STATUS[r.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#14142b]">
                        <span dir="auto" className="line-clamp-2 max-w-[340px] whitespace-pre-line">
                          {r.question || <span className="text-[#3b3a55]">(empty)</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#14142b]">
                        {r.correct ? (
                          <span dir="auto">
                            {r.correct}
                            {r.correctText ? `: ${r.correctText}` : ""}
                          </span>
                        ) : (
                          <span className="text-[#3b3a55]">-</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${r.status === "error" ? "text-red-700" : "text-[#3b3a55]"}`}>
                        {r.messages.length === 0 ? (
                          "-"
                        ) : (
                          <ul className="flex flex-col gap-1">
                            {r.messages.map((m) => (
                              <li key={m}>{m}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
