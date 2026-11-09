import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import s from "@/components/school/school.module.css";
import { isTestPost, parseClassSubject } from "@/lib/test-posts";

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

// Label + colour (strip and pill) for what the post is
function kindOf(p: PostCardData): { label: string; strip: string } {
  if (isTestPost(p)) {
    switch (p.division) {
      case "TEST_SERIES":
        return { label: "Test series", strip: "bg-(--hp-mint)" };
      case "CHAPTER_WISE_TEST":
        return { label: "Chapter test", strip: "bg-(--hp-lavender)" };
      case "BOARD_LEVEL_TEST":
        return { label: "Board-level test", strip: "bg-(--hp-coral)" };
      case "DPP":
        return { label: "DPP", strip: "bg-(--hp-yellow)" };
      default:
        return { label: "Test", strip: "bg-(--hp-sky)" };
    }
  }
  if (p.type === "INTERNSHIP") return { label: "Internship", strip: "bg-(--hp-mint)" };
  if (p.contentType === "NOTES") return { label: "Notes", strip: "bg-(--hp-sky)" };
  if (p.division === "CBSE_SAMPLE_PAPERS") return { label: "Sample paper", strip: "bg-(--hp-coral)" };
  if (p.contentType === "SOLUTION" || p.division === "NCERT_SOLUTION" || p.type === "SOLUTION")
    return { label: "Solution", strip: "bg-(--hp-pink)" };
  return { label: "Study material", strip: "bg-(--hp-lavender)" };
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// `now` (ms) comes from the page, read once when the data loads, so rendering stays pure
export default function PostCard({ post, now }: { post: PostCardData; now: number }) {
  const kind = kindOf(post);
  const isTest = isTestPost(post);
  const { classNo, subject } = parseClassSubject(post.category?.name);
  const meta = [
    classNo ? `Class ${classNo}` : null,
    subject ?? (classNo ? null : post.category?.name ?? null),
    post.chapter ? `Chapter ${post.chapter}` : null,
  ].filter(Boolean);
  const ended = new Date(post.applyDeadline).getTime() < now;

  return (
    <Link href={`/opportunities/${post.id}`} className={`${s.press} h-full [--radius:22px]`}>
      <span className={`${s.face} h-full flex-col overflow-hidden bg-white`}>
        {/* Colour strip for the type (decorative; the type is also written in the pill) */}
        <span aria-hidden="true" className={`block h-3 shrink-0 border-b-[3px] border-(--hp-ink) ${kind.strip}`} />
        <span className="flex flex-1 flex-col p-4 sm:p-5">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border-2 border-(--hp-ink) px-2.5 py-0.5 text-xs font-extrabold ${kind.strip}`}>
              {kind.label}
            </span>
            {post.requiresCode && (
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-(--hp-ink) bg-(--hp-butter) px-2 py-0.5 text-xs font-extrabold">
                <IconLock size={12} stroke={2.6} aria-hidden="true" />
                Code
              </span>
            )}
          </span>
          <span className={`${s.display} mt-2.5 block text-[19px] leading-snug font-bold break-words`}>{post.title}</span>
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
