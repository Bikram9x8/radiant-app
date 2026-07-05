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
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">Opportunity not found</h1>
        <Link href="/opportunities" className="text-blue-700 font-semibold">
          Back to opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 px-6 mb-12">
      <Link href="/opportunities" className="text-sm text-blue-700 font-semibold">
        ← Back to opportunities
      </Link>

      <div className="border rounded-lg p-6 mt-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{opportunity.title}</h1>
            <p className="text-zinc-500">
              {opportunity.company?.companyName} • {opportunity.category?.name}
            </p>
          </div>
          <span className="text-xs font-medium border rounded px-2 py-1">{opportunity.type}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
          <span>📍 {opportunity.location || "Not specified"} ({opportunity.mode})</span>
          <span>💰 {opportunity.stipendOrPrize || "Not disclosed"}</span>
          <span>⏰ Apply by {new Date(opportunity.applyDeadline).toLocaleDateString()}</span>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-1">Description</h2>
          <p className="text-sm whitespace-pre-line">{opportunity.description}</p>
        </div>

        {opportunity.eligibility && (
          <div className="mt-4">
            <h2 className="font-semibold mb-1">Eligibility</h2>
            <p className="text-sm">{opportunity.eligibility}</p>
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          {success || alreadyApplied ? (
            <p className="text-green-600 font-semibold">✓ You've applied to this opportunity</p>
          ) : (
            <>
              <label className="block text-sm font-medium mb-2">Cover note (optional)</label>
              <textarea
                className="border rounded px-3 py-2 w-full mb-3"
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Why are you a good fit for this opportunity?"
              />
              {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
              <button
                onClick={handleApply}
                disabled={applying}
                className="rounded px-5 py-2 bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
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
