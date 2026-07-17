"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const TYPES = ["JOB", "INTERNSHIP", "COMPETITION", "QUIZ", "HACKATHON", "EVENT"];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (type) params.set("type", type);
      if (categoryId) params.set("categoryId", categoryId);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setCategories(data.categories || []);
      setLoading(false);
    }
    load();
  }, [search, type, categoryId]);

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 mb-12">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Opportunities</h1>

      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2 flex-1 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2 outline-none text-zinc-900 dark:text-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="bg-white/70 dark:bg-zinc-900/70 rounded-xl px-3 py-2 outline-none text-zinc-900 dark:text-white"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>}

      {!loading && opportunities.length === 0 && (
        <p className="text-zinc-600 dark:text-zinc-400">No opportunities found yet. Check back soon!</p>
      )}

      <div className="flex flex-col gap-4">
        {opportunities.map((op) => (
          <Link
            key={op.id}
            href={`/opportunities/${op.id}`}
            className="glass rounded-2xl p-5 hover:scale-[1.01] transition-transform"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg text-zinc-900 dark:text-white">{op.title}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {op.company?.companyName} • {op.category?.name}
                </p>
              </div>
              <span className="text-xs font-medium bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1">
                {op.type}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Apply by {new Date(op.applyDeadline).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}