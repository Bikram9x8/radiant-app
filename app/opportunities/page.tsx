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
      <h1 className="text-2xl font-bold mb-6">Opportunities</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          className="border rounded px-3 py-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-zinc-500">Loading...</p>}

      {!loading && opportunities.length === 0 && (
        <p className="text-zinc-500">No opportunities found yet. Check back soon!</p>
      )}

      <div className="flex flex-col gap-4">
        {opportunities.map((op) => (
          <Link
            key={op.id}
            href={`/opportunities/${op.id}`}
            className="border rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{op.title}</h2>
                <p className="text-sm text-zinc-500">{op.company?.companyName} • {op.category?.name}</p>
              </div>
              <span className="text-xs font-medium border rounded px-2 py-1">{op.type}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-2">
              Apply by {new Date(op.applyDeadline).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
