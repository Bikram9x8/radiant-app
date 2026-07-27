"use client";

import { useState } from "react";

type Opportunity = { id: string; title: string };

export default function AccessCodesManager({ opportunities }: { opportunities: Opportunity[] }) {
  const [opportunityId, setOpportunityId] = useState("");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [codes, setCodes] = useState<string[]>([]);

  async function handleGenerate() {
    setError("");
    if (!opportunityId) {
      setError("Please select a test.");
      return;
    }

    setGenerating(true);
    const res = await fetch("/api/admin/access-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, count }),
    });
    setGenerating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }

    const data = await res.json();
    setCodes(data.codes.map((c: any) => c.code));
  }

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-5">
      {opportunities.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No tests currently require an access code. Mark a test as "Requires access code" when posting it.
        </p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-900 dark:text-white">Select test</label>
            <select
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-zinc-900 dark:text-white"
            >
              <option value="">Select a test</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-900 dark:text-white">
              How many codes?
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2 outline-none text-zinc-900 dark:text-white"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl px-5 py-2.5 bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 self-start"
          >
            {generating ? "Generating..." : "Generate Codes"}
          </button>

          {codes.length > 0 && (
            <div className="mt-2">
              <h2 className="font-semibold text-sm mb-2 text-zinc-900 dark:text-white">
                {codes.length} codes generated:
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {codes.map((code) => (
                  <div
                    key={code}
                    className="text-sm font-mono bg-white/70 dark:bg-zinc-900/70 rounded-lg px-3 py-2 text-zinc-900 dark:text-white"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}