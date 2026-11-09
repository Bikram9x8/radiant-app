"use client";
import { useSession } from "next-auth/react";
import SecureTestViewer from "./SecureTestViewer";
import dynamic from "next/dynamic";
const PlainTestViewer = dynamic(() => import("./PlainTestViewer"), { ssr: false });
import { IconLock, IconLockOpen, IconFileText, IconTool, IconTargetArrow, IconPackage, IconClipboardList, IconSchool, IconBook, IconBook2 } from "@tabler/icons-react";
import { getShortLabel } from "@/lib/categoryLabel";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/school/school.module.css";

// Icon and tile colour per division (Option B pastels, ink outline)
const DIVISION_ICONS: Record<string, { Icon: any; bg: string }> = {
  NCERT_SOLUTION: { Icon: IconBook2, bg: "bg-(--hp-lavender)" },
  TEST_SERIES: { Icon: IconFileText, bg: "bg-(--hp-mint)" },
  SKILL_BUILDING: { Icon: IconTool, bg: "bg-(--hp-pink)" },
  CAREER_COUNSELING: { Icon: IconTargetArrow, bg: "bg-(--hp-sky)" },
  STUDY_PACKAGE: { Icon: IconPackage, bg: "bg-(--hp-mint)" },
  DPP: { Icon: IconClipboardList, bg: "bg-(--hp-yellow)" },
  BOARD_LEVEL_TEST: { Icon: IconSchool, bg: "bg-(--hp-coral)" },
  CHAPTER_WISE_TEST: { Icon: IconBook, bg: "bg-(--hp-lavender)" },
};
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { Skeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import ViewTracker from "@/components/ViewTracker";
import { setNavSection } from "@/components/nav-section";

// Reading material rather than a test: "What's inside", and no "Available until" date
const READING_TYPES = ["NOTES", "SOLUTION"];

// Page wrapper: fonts + colour tokens; a calm, wide reading column (PDF pages get more width)
const shell = `${fredoka.variable} ${nunito.variable} ${s.page} flex-1`;
const column = "mx-auto w-full max-w-[880px] px-3 pt-6 pb-14 sm:px-6 md:pt-10";
const backLinkClass =
  "inline-flex min-h-11 items-center px-1 text-[15px] font-extrabold text-(--hp-link) underline-offset-4 hover:underline";
// Buttons: ink pill (main action on this page), purple pill (sign up)
const inkButton = `${s.flat} inline-flex min-h-12 items-center justify-center rounded-full bg-(--hp-ink) px-6 text-base font-extrabold text-white disabled:opacity-50`;
const purpleButton = `${s.flat} inline-flex min-h-12 items-center justify-center rounded-full bg-(--hp-purple) px-6 text-base font-extrabold text-white no-underline`;

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { status } = useSession();
  const { showToast } = useToast();
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeUnlocked, setCodeUnlocked] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [alreadyLocked, setAlreadyLocked] = useState(false);

  const [opportunity, setOpportunity] = useState<any>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [applicationsClosed, setApplicationsClosed] = useState(false);
  const [backLink, setBackLink] = useState<{ href: string; label: string } | null>(null);

  useEffect(() => {
    async function load() {
      // ?level= comes from the internship cards; the API validates it before using it
      const level = new URLSearchParams(window.location.search).get("level");
      const res = await fetch(`/api/opportunities/${id}` + (level ? `?level=${encodeURIComponent(level)}` : ""));
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOpportunity(data.opportunity);
      setAlreadyApplied(data.alreadyApplied);
      setCodeUnlocked(data.codeUnlocked || false);
      setAlreadyLocked(data.isLocked || false);
      setApplicationsClosed(data.applicationsClosed || false);
      setBackLink(data.backLink || null);
      // Header highlights the section this post belongs to (School / Higher / Tests)
      setNavSection(data.navSection || null);
      setLoading(false);
    }
    load();
  }, [id]);

  // Leaving the page: the header goes back to working it out from the URL
  useEffect(() => () => setNavSection(null), []);

  async function handleRedeemCode() {
    setCodeError("");
    setRedeeming(true);

    const res = await fetch("/api/access-codes/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id, code }),
    });

    setRedeeming(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setCodeError(data.error || "Something went wrong.");
      return;
    }

    setCodeUnlocked(true);
    setJustUnlocked(true);
    showToast("Code redeemed — test unlocked!");
  }

  async function handleApply() {
    setApplying(true);
    setError("");

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id, coverNote }),
    });

    setApplying(false);

    if (res.status === 403) {
      router.push("/login");
      return;
    }

    if (res.ok) {
      setSuccess(true);
      setAlreadyApplied(true);
      showToast("Application submitted!");
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className={shell}>
        <div className={column}>
          <Skeleton className="h-4 w-40 mb-5" />
          <div className={`${s.readCard} p-5 sm:p-8`}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0" />
            </div>
            <Skeleton className="h-4 w-full mt-6" />
            <Skeleton className="h-4 w-5/6 mt-2" />
            <Skeleton className="h-4 w-2/3 mt-2" />
            <Skeleton className="h-11 w-32 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={`${shell} flex flex-col items-center justify-center gap-4 px-4 py-16 text-center`}>
        <div className={`${s.readCard} p-8`}>
          <h1 className={`${s.display} text-[28px] font-bold`}>Opportunity not found</h1>
          <Link href="/opportunities" className={`${backLinkClass} mt-2`}>
            Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  const isQuiz = opportunity.type === "QUIZ" || opportunity.type === "SOLUTION";
  const isInternship = opportunity.type === "INTERNSHIP";
  const isReading = READING_TYPES.includes(opportunity.contentType);
  return (
    <div className={shell}>
      <div className={column}>
        <ViewTracker opportunityId={opportunity.id} />
        {backLink ? (
          <Link href={backLink.href} className={backLinkClass}>
            ← Back to {backLink.label}
          </Link>
        ) : (
          <Link href="/opportunities" className={backLinkClass}>
            ← Back to opportunities
          </Link>
        )}

        <FadeIn>
        <div className={`${s.readCard} mt-3 p-5 sm:p-8`}>
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {(() => {
                const meta = DIVISION_ICONS[opportunity.division] ?? DIVISION_ICONS.TEST_SERIES;
                const label = getShortLabel(opportunity.category?.name);
                return (
                  <div
                    className={`relative shrink-0 w-12 h-12 rounded-2xl border-2 border-(--hp-ink) ${meta.bg} flex items-center justify-center`}
                  >
                    <meta.Icon size={22} color="var(--hp-ink)" stroke={2} aria-hidden="true" />
                    {label && (
                      <span className="absolute -bottom-1.5 -right-1.5 min-w-[18px] rounded-full border-2 border-(--hp-ink) bg-white px-1 text-center text-[9px] font-extrabold leading-[14px]">
                        {label}
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className="min-w-0">
                <h1 className={`${s.display} m-0 text-[28px] leading-[1.15] font-bold break-words sm:text-[34px]`}>
                  {opportunity.title}
                </h1>
                <p className="mt-1.5 text-[15px] font-semibold text-(--hp-muted)">
                  {opportunity.company?.companyName} • {opportunity.category?.name}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-(--hp-lavender-soft) px-3.5 py-1.5 text-xs font-extrabold text-(--hp-purple-deep)">
              {opportunity.type}
            </span>
          </div>


          {!isQuiz && (
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[15px] font-semibold text-(--hp-muted)">
              <span>📍 {opportunity.location || "Not specified"} ({opportunity.mode})</span>
              <span>💰 {opportunity.stipendOrPrize || "Not disclosed"}</span>
              {opportunity.duration && <span>⏱ {opportunity.duration}</span>}
            </div>
          )}
          {/* Notes and solutions have no meaningful end date */}
          {!isReading && (
            <div className="mt-2 text-[15px] font-semibold text-(--hp-muted)">
              ⏰ {isQuiz ? "Available until" : "Apply by"}{" "}
              {isInternship
                ? new Date(opportunity.applyDeadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })
                : new Date(opportunity.applyDeadline).toLocaleDateString()}
              {applicationsClosed && (
                <span className="ml-1 font-extrabold text-red-700">· Applications closed</span>
              )}
            </div>
          )}

          <div className="mt-7">
            <h2 className={`${s.display} m-0 mb-2 text-xl font-bold`}>
              {isReading ? "What's inside" : isQuiz ? "What this test covers" : "Description"}
            </h2>
            <p className={`${s.readingCopy} m-0 whitespace-pre-line`}>{opportunity.description}</p>
          </div>

          {opportunity.eligibility && (
            <div className="mt-6">
              <h2 className={`${s.display} m-0 mb-2 text-xl font-bold`}>Eligibility</h2>
              <p className={`${s.readingCopy} m-0`}>{opportunity.eligibility}</p>
            </div>
          )}

          <div className="mt-7 border-t-2 border-(--hp-line) pt-6">
            {isQuiz ? (
              opportunity.requiresCode && codeUnlocked && alreadyLocked ? (
                <div className="rounded-[20px] border-2 border-red-200 bg-red-50 p-6 text-center sm:p-8">
                  <h2 className={`${s.display} mb-2 text-xl font-bold text-red-700`}>Test Locked</h2>
                  <p className={`${s.readingCopy} mx-auto`}>
                    This test was locked because you switched tabs or apps. Contact your institute to request access again.
                  </p>
                </div>
              ) : opportunity.requiresCode && codeUnlocked ? (
                <SecureTestViewer opportunityId={id} pdfUrl={opportunity.externalLink} />
              ) : opportunity.requiresCode && !codeUnlocked ? (
                <div>
                  <div className="flex justify-center mb-4">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--hp-ink) bg-(--hp-butter) transition-transform duration-300"
                      style={{ transform: justUnlocked ? "scale(1.3) rotate(-8deg)" : "scale(1)" }}
                    >
                      {justUnlocked ? (
                        <IconLockOpen size={26} className="text-emerald-700" stroke={2} />
                      ) : (
                        <IconLock size={26} className="text-(--hp-ink)" stroke={2} />
                      )}
                    </div>
                  </div>
                  <label htmlFor="access-code" className="mb-2 block text-[15px] font-extrabold">
                    Enter access code
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id="access-code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="RAD-XXXXXXX"
                      className={`${s.field} min-h-12 min-w-0 flex-1 basis-[180px] rounded-full px-5 text-base font-semibold`}
                    />
                    <button
                      onClick={handleRedeemCode}
                      disabled={redeeming || !code}
                      className={inkButton}
                    >
                      {redeeming ? "Checking..." : "Unlock"}
                    </button>
                  </div>
                  {codeError && <p className="mt-2 text-[15px] font-bold text-red-700">{codeError}</p>}
                  <p className="mt-2 text-sm font-semibold text-(--hp-muted)">
                    Get this code from your institute to unlock this test. Note: signing up is still required to redeem a code.
                  </p>
                </div>
              ) : opportunity.externalLink ? (
                <div>
                  <PlainTestViewer pdfUrl={opportunity.externalLink} />
                  <div className="mt-5">
                    {status === "authenticated" ? (
                      <a
                        href={opportunity.externalLink.replace("/upload/", "/upload/fl_attachment/")}
                        className={`${inkButton} no-underline`}
                      >
                        Download PDF
                      </a>
                    ) : (
                      <Link href="/signup" className={purpleButton}>
                        Sign up to download →
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[15px] font-semibold text-(--hp-muted)">Test link not available.</p>
              )
            ) : applicationsClosed && !(success || alreadyApplied) ? (
              <div>
                <p className="font-extrabold text-red-700">Applications closed</p>
                <p className="mt-1 text-[15px] font-semibold text-(--hp-muted)">
                  The deadline for this internship has passed.
                </p>
              </div>
            ) : status !== "authenticated" ? (
              <Link href="/signup" className={purpleButton}>
                Sign up to apply →
              </Link>
            ) : success || alreadyApplied ? (
              <p className="font-extrabold text-emerald-700">✓ You&apos;ve applied to this opportunity</p>
            ) : (
              <>
                <label htmlFor="cover-note" className="mb-2 block text-[15px] font-extrabold">
                  Cover note (optional)
                </label>
                <textarea
                  id="cover-note"
                  className={`${s.field} mb-3 w-full rounded-2xl px-4 py-3 text-base leading-relaxed`}
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Why are you a good fit for this opportunity?"
                />
                {error && <p className="mb-2 text-[15px] font-bold text-red-700">{error}</p>}
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className={inkButton}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              </>
            )}
          </div>
        </div>
        </FadeIn>
      </div>
    </div>
  );
}
