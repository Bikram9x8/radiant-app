// Shared server-side code for MCQ tests: input validation, chapter checks,
// answer-free question shapes, signed start tokens and scoring.
// Server only: imports prisma and NEXTAUTH_SECRET, never import from client components.
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import type { McqOption, Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MCQ_COURSE_SLUGS, MCQ_OPTIONS, QUESTION_LIMITS, type McqChapter } from "@/lib/mcq-shared";

export { MCQ_COURSE_SLUGS, MCQ_OPTIONS };
export type { McqChapter };
export const LATE_GRACE_SEC = 60;
export const START_TOKEN_MAX_AGE_SEC = 24 * 60 * 60;
const CLOCK_SKEW_MS = 5000;

// ================= INPUT SCHEMAS =================

// Optional text: trimmed, empty becomes null
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null);

export const questionInput = z.object({
  chapterId: z.string().trim().min(1),
  text: z.string().trim().min(1).max(QUESTION_LIMITS.text),
  optionA: z.string().trim().min(1).max(QUESTION_LIMITS.option),
  optionB: z.string().trim().min(1).max(QUESTION_LIMITS.option),
  optionC: z.string().trim().min(1).max(QUESTION_LIMITS.option),
  optionD: z.string().trim().min(1).max(QUESTION_LIMITS.option),
  correctOption: z.enum(MCQ_OPTIONS),
  explanation: optionalText(QUESTION_LIMITS.explanation),
  imageUrl: optionalText(1000).refine((v) => v === null || /^https:\/\/\S+$/.test(v), {
    message: "Image URL must start with https://",
  }),
});
export type QuestionInput = z.infer<typeof questionInput>;

export const testInput = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText(1000),
  chapterId: z.string().trim().min(1),
  timeLimitMin: z.number().int().min(1).max(300).nullable(), // null = untimed
  isPublished: z.boolean(),
});
export type TestInput = z.infer<typeof testInput>;

// Ordered question list for a test; list order is the question order
export const testQuestionsInput = z.object({
  questionIds: z
    .array(z.string().min(1))
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, { message: "A question is listed twice" }),
});

export const questionActiveInput = z.object({ isActive: z.boolean() });

// First validation problem as a short message for API responses
export function zodMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input";
  return issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message;
}

export const submitInput = z.object({
  token: z.string().min(1).max(500),
  answers: z
    .record(z.string(), z.enum(MCQ_OPTIONS).nullable())
    .refine((a) => Object.keys(a).length <= 200, { message: "Too many answers" }),
});
export type SubmitInput = z.infer<typeof submitInput>;

// ================= ADMIN =================

// The logged-in admin's user id, or null for anyone else
export async function getAdminUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.role === "ADMIN" && user.id ? user.id : null;
}

// Full question for admin pages, with how widely it is used
export const ADMIN_QUESTION_SELECT = {
  id: true,
  chapterId: true,
  text: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  correctOption: true,
  explanation: true,
  imageUrl: true,
  isActive: true,
  testLinks: { select: { test: { select: { isPublished: true } } } },
  _count: { select: { answers: true } },
} satisfies Prisma.McqQuestionSelect;

type AdminQuestionRow = Prisma.McqQuestionGetPayload<{ select: typeof ADMIN_QUESTION_SELECT }>;

export type AdminQuestion = Omit<AdminQuestionRow, "testLinks" | "_count"> & {
  usedInTests: number;
  usedInPublished: number;
  answerCount: number;
};

// Activity Log entry for publishing, unpublishing or deleting a test
export function mcqTestLog(actorId: string, action: "PUBLISH_MCQ_TEST" | "UNPUBLISH_MCQ_TEST" | "DELETE_MCQ_TEST", testId: string, title: string) {
  return prisma.adminLog.create({
    data: { actorId, action, targetType: "McqTest", targetId: testId, notes: title },
  });
}

export function toAdminQuestion(q: AdminQuestionRow): AdminQuestion {
  const { testLinks, _count, ...rest } = q;
  return {
    ...rest,
    usedInTests: testLinks.length,
    usedInPublished: testLinks.filter((l) => l.test.isPublished).length,
    answerCount: _count.answers,
  };
}

// ================= CHAPTERS =================

const NODE_SELECT = {
  id: true,
  name: true,
  slug: true,
  kind: true,
  isActive: true,
  parentId: true,
  chapterNo: true,
} satisfies Prisma.CourseNodeSelect;

// An active CHAPTER whose course is cbse, icse or competitive (and whose ancestors are active), else null.
// Tree depth differs between courses, so this follows parent links instead of assuming a depth.
export async function getMcqChapter(chapterId: string): Promise<McqChapter | null> {
  const chapter = await prisma.courseNode.findUnique({ where: { id: chapterId }, select: NODE_SELECT });
  if (!chapter || chapter.kind !== "CHAPTER" || !chapter.isActive) return null;

  const trail: McqChapter["trail"] = [];
  let parentId = chapter.parentId;
  for (let depth = 0; parentId && depth < 8; depth++) {
    const node = await prisma.courseNode.findUnique({ where: { id: parentId }, select: NODE_SELECT });
    if (!node || !node.isActive) return null;
    trail.unshift({ id: node.id, name: node.name, slug: node.slug, kind: node.kind });
    parentId = node.parentId;
  }
  if (parentId) return null; // deeper than any real branch

  const root = trail[0];
  if (!root || root.kind !== "COURSE" || !MCQ_COURSE_SLUGS.includes(root.slug)) return null;
  return { id: chapter.id, name: chapter.name, slug: chapter.slug, chapterNo: chapter.chapterNo, trail };
}

// ================= QUESTION SHAPES =================

// Never includes correctOption or explanation, so public reads can't leak answers
export const PUBLIC_QUESTION_SELECT = {
  id: true,
  text: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  imageUrl: true,
} satisfies Prisma.McqQuestionSelect;

const ANSWER_KEY_SELECT = {
  ...PUBLIC_QUESTION_SELECT,
  correctOption: true,
  explanation: true,
} satisfies Prisma.McqQuestionSelect;

type PublicQuestionRow = Prisma.McqQuestionGetPayload<{ select: typeof PUBLIC_QUESTION_SELECT }>;
type AnswerKeyRow = Prisma.McqQuestionGetPayload<{ select: typeof ANSWER_KEY_SELECT }>;

export type PublicQuestion = {
  id: string;
  text: string;
  options: Record<McqOption, string>;
  imageUrl: string | null;
};

export function toPublicQuestion(q: PublicQuestionRow): PublicQuestion {
  return {
    id: q.id,
    text: q.text,
    options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
    imageUrl: q.imageUrl,
  };
}

// A published test with its active questions in order, without answers
export async function getPublicTest(testId: string) {
  const test = await prisma.mcqTest.findFirst({
    where: { id: testId, isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      chapterId: true,
      timeLimitMin: true,
      questions: {
        where: { question: { isActive: true } }, // deactivated questions drop out of tests
        orderBy: { position: "asc" },
        select: { question: { select: PUBLIC_QUESTION_SELECT } },
      },
    },
  });
  if (!test) return null;
  return { ...test, questions: test.questions.map((tq) => toPublicQuestion(tq.question)) };
}

// Same test with correct answers and explanations: for scoring and the answer key only
export async function getTestWithAnswers(testId: string) {
  const test = await prisma.mcqTest.findFirst({
    where: { id: testId, isPublished: true },
    select: {
      id: true,
      title: true,
      chapterId: true,
      timeLimitMin: true,
      questions: {
        where: { question: { isActive: true } },
        orderBy: { position: "asc" },
        select: { question: { select: ANSWER_KEY_SELECT } },
      },
    },
  });
  if (!test) return null;
  return { ...test, questions: test.questions.map((tq) => tq.question) };
}

// ================= STUDENTS =================

export type McqViewer = { kind: "guest" } | { kind: "student"; studentId: string } | { kind: "other" };

// Who is taking a test: only STUDENT accounts with a profile get attempts saved
export async function getMcqViewer(): Promise<McqViewer> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { kind: "guest" };
  if (user.role !== "STUDENT") return { kind: "other" };
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  return profile ? { kind: "student", studentId: profile.id } : { kind: "other" };
}

// The attempt and every answer in one transaction
export async function saveAttempt(data: {
  studentId: string;
  testId: string;
  score: number;
  total: number;
  timeTakenSec: number;
  isLate: boolean;
  startedAt: Date;
  results: QuestionResult[];
}): Promise<string> {
  const id = randomUUID();
  await prisma.$transaction([
    prisma.mcqAttempt.create({
      data: {
        id,
        studentId: data.studentId,
        testId: data.testId,
        score: data.score,
        total: data.total,
        timeTakenSec: data.timeTakenSec,
        isLate: data.isLate,
        startedAt: data.startedAt,
      },
    }),
    prisma.mcqAnswer.createMany({
      data: data.results.map((r) => ({
        attemptId: id,
        questionId: r.questionId,
        selectedOption: r.selected,
        isCorrect: r.isCorrect,
      })),
    }),
  ]);
  return id;
}

// ================= START TOKEN =================
// Starting a test writes nothing; the server signs { testId, startedAt } and checks it on submit.

function tokenSignature(payload: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  // "mcq-start:" keeps these signatures separate from anything else signed with the same secret
  return createHmac("sha256", secret).update(`mcq-start:${payload}`).digest("base64url");
}

export function signStartToken(testId: string, now: Date = new Date()): string {
  const payload = Buffer.from(JSON.stringify({ t: testId, s: now.getTime() })).toString("base64url");
  return `${payload}.${tokenSignature(payload)}`;
}

// The start time if the token is genuine, for this test, not from the future and under 24h old; else null
export function verifyStartToken(token: string, testId: string, now: Date = new Date()): Date | null {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, signature] = parts;

  const expected = Buffer.from(tokenSignature(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  let data: unknown;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const { t, s } = data as { t?: unknown; s?: unknown };
  if (t !== testId || typeof s !== "number" || !Number.isFinite(s)) return null;

  const ageMs = now.getTime() - s;
  if (ageMs < -CLOCK_SKEW_MS || ageMs > START_TOKEN_MAX_AGE_SEC * 1000) return null;
  return new Date(s);
}

// ================= SCORING =================

export type QuestionResult = {
  questionId: string;
  selected: McqOption | null; // null = skipped
  correct: McqOption;
  isCorrect: boolean;
};

// Pure scoring: answers for questions not in the test are ignored, missing answers count as skipped.
// Late = more than LATE_GRACE_SEC past the time limit; late attempts are still scored.
export function scoreAttempt({
  questions,
  answers,
  startedAt,
  now,
  timeLimitMin,
}: {
  questions: { id: string; correctOption: McqOption }[];
  answers: Record<string, McqOption | null>;
  startedAt: Date;
  now: Date;
  timeLimitMin: number | null;
}) {
  const results: QuestionResult[] = questions.map((q) => {
    const selected = Object.hasOwn(answers, q.id) ? answers[q.id] : null;
    return { questionId: q.id, selected, correct: q.correctOption, isCorrect: selected === q.correctOption };
  });
  const timeTakenSec = Math.max(0, Math.round((now.getTime() - startedAt.getTime()) / 1000));
  return {
    score: results.filter((r) => r.isCorrect).length,
    total: questions.length,
    timeTakenSec,
    isLate: timeLimitMin !== null && timeTakenSec > timeLimitMin * 60 + LATE_GRACE_SEC,
    results,
  };
}

export type ReviewQuestion = PublicQuestion & {
  correctOption: McqOption;
  explanation: string | null;
  selected: McqOption | null;
  isCorrect: boolean;
};

type Graded =
  | { ok: false; status: number; error: string }
  | {
      ok: true;
      testId: string;
      startedAt: Date;
      result: ReturnType<typeof scoreAttempt>;
      review: ReviewQuestion[];
    };

// Checks a submission and scores it on the server. Saves nothing.
export async function gradeSubmission(testId: string, body: unknown, now: Date = new Date()): Promise<Graded> {
  const parsed = submitInput.safeParse(body);
  if (!parsed.success) return { ok: false, status: 400, error: "The answers couldn't be read. Please try again." };

  const test = await getTestWithAnswers(testId);
  if (!test) return { ok: false, status: 404, error: "This test is no longer available." };
  if (test.questions.length === 0) return { ok: false, status: 409, error: "This test has no questions right now." };

  const startedAt = verifyStartToken(parsed.data.token, testId, now);
  if (!startedAt) {
    return { ok: false, status: 400, error: "This test session has expired. Please start the test again." };
  }

  const result = scoreAttempt({
    questions: test.questions.map((q) => ({ id: q.id, correctOption: q.correctOption })),
    answers: parsed.data.answers,
    startedAt,
    now,
    timeLimitMin: test.timeLimitMin,
  });
  const review = test.questions.map((q, i) => toReviewQuestion(q, result.results[i]));
  return { ok: true, testId, startedAt, result, review };
}

// Shown only after submitting
export function toReviewQuestion(q: AnswerKeyRow, result: QuestionResult): ReviewQuestion {
  return {
    ...toPublicQuestion(q),
    correctOption: q.correctOption,
    explanation: q.explanation,
    selected: result.selected,
    isCorrect: result.isCorrect,
  };
}
