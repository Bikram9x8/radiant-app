// MCQ constants that are safe to use in client components (no prisma, no secrets).
// lib/mcq.ts re-exports these for server code.

// Courses whose chapters can have MCQ tests
export const MCQ_COURSE_SLUGS = ["cbse", "icse", "competitive"];
export const MCQ_OPTIONS = ["A", "B", "C", "D"] as const;
export type McqOptionKey = (typeof MCQ_OPTIONS)[number];

export const QUESTION_LIMITS = { text: 2000, option: 500, explanation: 3000 };
export const QUESTION_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
