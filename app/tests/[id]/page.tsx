import type { Metadata } from "next";
import Link from "next/link";
import { getMcqChapter, getMcqViewer, getPublicTest } from "@/lib/mcq";
import { chapterLabel, chapterPath } from "@/lib/mcq-shared";
import { primaryButton } from "@/components/mcq/ui";
import TestRunner from "./TestRunner";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const test = await getPublicTest(id);
  return { title: test ? `${test.title} | Radiant Educations` : "Test not available | Radiant Educations" };
}

// Public: anyone can take a published test. Answers are never part of this page.
export default async function TakeTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getPublicTest(id);

  if (!test || test.questions.length === 0) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14142b]">This test isn&apos;t available</h1>
          <p className="mt-2 text-[#3b3a55]">It may have been taken down or moved. Find other tests in your course.</p>
          <Link href="/school" className={`${primaryButton} mt-5`}>
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  const [chapter, viewer] = await Promise.all([getMcqChapter(test.chapterId), getMcqViewer()]);

  return (
    <TestRunner
      test={{ id: test.id, title: test.title, description: test.description, timeLimitMin: test.timeLimitMin }}
      questions={test.questions}
      chapter={chapter ? { label: chapterLabel(chapter), path: chapterPath(chapter) } : null}
      viewer={viewer.kind}
    />
  );
}
