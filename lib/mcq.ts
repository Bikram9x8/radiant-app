// Shared server-side code for MCQ tests: input validation, chapter checks,
// answer-free question shapes, signed start tokens and scoring.
// Server only: imports prisma and NEXTAUTH_SECRET, never import from client components.
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import type { McqOption, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const MCQ_COURSE_SLUGS = ["cbse", "icse", "competitive"];
export const MCQ_OPTIONS = ["A", "B", "C", "D"] as const;
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
  text: z.string().trim().min(1).max(2000),
  optionA: z.string().trim().min(1).max(500),
  optionB: z.string().trim().min(1).max(500),
  optionC: z.string().trim().min(1).max(500),
  optionD: z.string().trim().min(1).max(500),
  correctOption: z.enum(MCQ_OPTIONS),
  explanation: optionalText(3000),
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

export const submitInput = z.object({
  token: z.string().min(1).max(500),
  answers: z
    .record(z.string(), z.enum(MCQ_OPTIONS).nullable())
    .refine((a) => Object.keys(a).length <= 200, { message: "Too many answers" }),
});
export type SubmitInput = z.infer<typeof submitInput>;

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

export type McqChapter = {
  id: string;
  name: string;
  chapterNo: number | null;
  // Ancestors from the course down to the chapter's parent (e.g. CBSE > Class 10 > Mathematics)
  trail: { id: string; name: string; slug: string; kind: string }[];
};

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
  return { id: chapter.id, name: chapter.name, chapterNo: chapter.chapterNo, trail };
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
