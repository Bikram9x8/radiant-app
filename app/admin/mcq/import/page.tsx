import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUserId, getMcqChapter } from "@/lib/mcq";
import ImportForm from "./ImportForm";
import { backLink, pageIntro, pageTitle } from "../ui";

export default async function McqImportPage({
  searchParams,
}: {
  searchParams: Promise<{ chapterId?: string }>;
}) {
  if (!(await getAdminUserId())) {
    redirect("/login");
  }
  const { chapterId } = await searchParams;
  const chapter = chapterId ? await getMcqChapter(chapterId) : null;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/admin/mcq/questions" className={backLink}>
        ← Question bank
      </Link>
      <h1 className={pageTitle}>Import questions</h1>
      <p className={`${pageIntro} mb-6`}>
        Upload an Excel (.xlsx) or CSV file. Every row is checked first, and nothing is saved until the whole file
        is free of errors.
      </p>
      {/* key: a new chapter starts a fresh import */}
      <ImportForm key={chapter?.id ?? "none"} chapter={chapter} invalidChapter={!!chapterId && !chapter} />
    </div>
  );
}
