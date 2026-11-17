import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExam, verifiedExams } from "@/lib/abroad";
import ComingSoonShell from "../../ComingSoonShell";

// Only verified exams have a page; every other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return verifiedExams().map((e) => ({ exam: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ exam: string }> }): Promise<Metadata> {
  const { exam } = await params;
  const e = getExam(exam);
  return { title: e ? `${e.name} | Study abroad | Radiant Educations` : "Study abroad | Radiant Educations" };
}

// Exam page (built in Part 5)
export default async function ExamPage({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const e = getExam(exam);
  if (!e) notFound();

  return (
    <ComingSoonShell
      crumb={{ href: "/abroad", label: "Study abroad" }}
      title={e.name}
      accent="guide"
      text="This exam guide is being prepared."
    />
  );
}
