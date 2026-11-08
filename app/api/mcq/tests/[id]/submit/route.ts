import { NextResponse } from "next/server";
import { getMcqViewer, gradeSubmission, saveAttempt } from "@/lib/mcq";

// Submit answers: scored on the server. Only logged-in students' attempts are saved.
// The response includes the correct answers and explanations (never sent before submitting).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const graded = await gradeSubmission(id, await req.json().catch(() => null));
  if (!graded.ok) {
    return NextResponse.json({ error: graded.error }, { status: graded.status });
  }

  const { result, review, startedAt } = graded;
  const viewer = await getMcqViewer();
  let saved = false;
  if (viewer.kind === "student") {
    await saveAttempt({
      studentId: viewer.studentId,
      testId: id,
      score: result.score,
      total: result.total,
      timeTakenSec: result.timeTakenSec,
      isLate: result.isLate,
      startedAt,
      results: result.results,
    });
    saved = true;
  }

  return NextResponse.json({
    score: result.score,
    total: result.total,
    timeTakenSec: result.timeTakenSec,
    isLate: result.isLate,
    saved,
    viewer: viewer.kind,
    review,
  });
}
