"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [opportunity, setOpportunity] = useState<any>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/opportunities/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setOpportunity(data.opportunity);
      setAlreadyApplied(data.alreadyApplied);
      setLoading(false);
    }
    load();
  }, [id]);

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
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Opportunity not found</h1>
          <Link href="/opportunities" className="text-purple-600 dark:text-purple-400 font-semibold mt-2 inline-block">
            Back to opportunities
          </Link>
        </div>
      </div>
    );
  }

  const isQuiz = opportunity.type === "QUIZ";

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6 mb-12">
      <Link href="/opportunities" className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
        ← Back to opportunities
      </Link>

      <div className="glass rounded-2xl p-6 mt-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{opportunity.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {opportunity.company?.companyName} • {opportunity.category?.name}
            </p>
          </div>
          <span className="text-xs font-medium bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1">
            {opportunity.type}
          </span>
        </div>

        {!isQuiz && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <span>📍 {opportunity.location || "Not specified"} ({opportunity.mode})</span>
            <span>💰 {opportunity.stipendOrPrize || "Not disclosed"}</span>
          </div>
        )}
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          ⏰ {isQuiz ? "Available until" : "Apply by"} {new Date(opportunity.applyDeadline).toLocaleDateString()}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-1 text-zinc-900 dark:text-white">
            {isQuiz ? "What this test covers" : "Description"}
          </h2>
          <p className="text-sm whitespace-pre-line text-zinc-700 dark:text-zinc-300">{opportunity.description}</p>
        </div>

        {opportunity.eligibility && (
          <div className="mt-4">
            <h2 className="font-semibold mb-1 text-zinc-900 dark:text-white">Eligibility</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{opportunity.eligibility}</p>
          </div>
        )}

        <div className="mt-6 border-t border-white/20 dark:border-white/10 pt-4">
          {isQuiz ? (
            opportunity.externalLink ? (
              <a
                href={opportunity.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl px-6 py-3 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
              >
                Take Test →
              </a>
            ) : (
              <p className="text-sm text-zinc-500">Test link not available.</p>
            )
          ) : success || alreadyApplied ? (
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ You've applied to this opportunity</p>
          ) : (
            <>
              <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-white">
                Cover note (optional)
              </label>
              <textarea
                className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2 w-full mb-3 outline-none text-zinc-900 dark:text-white"
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Why are you a good fit for this opportunity?"
              />
              {error && <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>}
              <button
                onClick={handleApply}
                disabled={applying}
                className="rounded-xl px-5 py-2.5 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}