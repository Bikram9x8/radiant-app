import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import s from "@/components/school/school.module.css";
import { entranceMeta, formatTestDate, isTestPost, parseClassSubject, postKindLabel } from "@/lib/test-posts";
import { SHOW_SCHOOL } from "@/lib/features";

// Result card for the Tests page (/opportunities) and Search (/search).
// Must be rendered inside a School-style wrapper (s.page), which provides the colour tokens.

export type PostCardData = {
  id: string;
  title: string;
  type: string;
  division?: string | null;
  contentType?: string | null;
  chapter?: number | null;
  requiresCode?: boolean;
  applyDeadline: string | Date;
  category?: { name: string } | null;
};

// Colour (strip and pill) for each kind of post; the label itself comes from lib/test-posts.ts
const STRIP: Record<string, string> = {
  "Test series": "bg-(--hp-mint)",
  "Chapter test": "bg-(--hp-lavender)",
  "Board-level test": "bg-(--hp-coral)",
  DPP: "bg-(--hp-yellow)",
  Test: "bg-(--hp-sky)",
  Internship: "bg-(--hp-mint)",
  Notes: "bg-(--hp-sky)",
  "Sample paper": "bg-(--hp-coral)",
  Solution: "bg-(--hp-pink)",
  "Study material": "bg-(--hp-lavender)",
};

function kindOf(p: PostCardData): { label: string; strip: string } {
  const label = postKindLabel(p);
  return { label, strip: STRIP[label] };
}

const formatDate = formatTestDate;

// `now` (ms) comes from the page, read once when the data loads, so rendering stays pure
export default function PostCard({ post, now }: { post: PostCardData; now: number }) {
  const kind = kindOf(post);
  const isTest = isTestPost(post);
  const { classNo, subject } = parseClassSubject(post.category?.name);
  // School Education switched off: tests read as entrance prep ("JEE / NEET prep · Physics"), no class
  const meta =
    !SHOW_SCHOOL && isTest
      ? [entranceMeta(post.category?.name), post.chapter ? `Chapter ${post.chapter}` : null].filter(Boolean)
      : [
          classNo ? `Class ${classNo}` : null,
          subject ?? (classNo ? null : post.category?.name ?? null),
          post.chapter ? `Chapter ${post.chapter}` : null,
        ].filter(Boolean);
  const ended = new Date(post.applyDeadline).getTime() < now;

  return (
    <Link href={`/opportunities/${post.id}`} className={`${s.press} h-full [--radius:18px]`}>
      <span className={`${s.face} h-full flex-col overflow-hidden bg-white`}>
        {/* Colour strip for the type (decorative; the type is also written in the pill) */}
        <span aria-hidden="true" className={`block h-3 shrink-0 border-b border-(--line) ${kind.strip}`} />
        <span className="flex flex-1 flex-col p-4 sm:p-5">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border border-(--line) px-2.5 py-0.5 text-xs font-extrabold ${kind.strip}`}>
              {kind.label}
            </span>
            {post.requiresCode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-(--line) bg-(--hp-butter) px-2 py-0.5 text-xs font-extrabold">
                <IconLock size={12} stroke={2.6} aria-hidden="true" />
                Code
              </span>
            )}
          </span>
          <span className={`${s.cardTitle} mt-2.5 block text-[18px] leading-snug break-words`}>{post.title}</span>
          {meta.length > 0 && (
            <span className="mt-1 block text-[15px] font-semibold text-(--hp-muted)">{meta.join(" · ")}</span>
          )}
          {/* Dates only mean something for tests (notes and solutions don't expire) */}
          {isTest && (
            <span className="mt-1 block text-sm font-bold text-(--hp-muted)">
              {ended ? `Ended ${formatDate(post.applyDeadline)}` : `Open till ${formatDate(post.applyDeadline)}`}
            </span>
          )}
          <span className="mt-auto flex justify-end pt-3 text-[15px] font-extrabold">
            {isTest ? "Start →" : "Open →"}
          </span>
        </span>
      </span>
    </Link>
  );
}
