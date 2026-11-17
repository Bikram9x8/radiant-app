import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMcqChapter, getMcqViewer, getPublicTest } from "@/lib/mcq";
import { chapterLabel, chapterPath } from "@/lib/mcq-shared";
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

  // Unknown, unpublished or empty test: "not available" page (./not-found.tsx) with status 404
  if (!test || test.questions.length === 0) notFound();

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
