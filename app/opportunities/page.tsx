"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const TYPES = ["JOB", "INTERNSHIP", "COMPETITION", "QUIZ", "HACKATHON", "EVENT"];

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const division = searchParams.get("division") || "";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signup");
    }
  }, [status, router]);

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
      if (division) params.set("division", division);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      setCategories(data.categories || []);
      setLoading(false);
    }
    load();
  }, [search, type, categoryId, division]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-6 mb-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8 text-zinc-900 dark:text-white">
        {division === "DPP"
          ? "Daily Practice Problems"
          : division === "BOARD_LEVEL_TEST"
          ? "Board Level Tests"
          : division === "CHAPTER_WISE_TEST"
          ? "Chapter Wise Tests"
          : division === "STUDY_PACKAGE"
          ? "Study Packages"
          : division === "SKILL_BUILDING"
          ? "Skill Building"
          : division === "CAREER_COUNSELING"
          ? "Career Counseling"
          : division
          ? division.replace(/_/g, " ")
          : "Opportunities"}
      </h1>

      <div className="glass rounded-3xl p-5 flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by title..."
          className="bg-white/70 dark:bg-zinc-900/70 rounded-2xl px-4 py-2.5 flex-1 min-w-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="bg-white/70 dark:bg-zinc-900/70 rounded-2xl px-4 py-2.5 outline-none text-zinc-900 dark:text-white min-w-0 max-w-full sm:max-w-[160px]"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="bg-white/70 dark:bg-zinc-900/70 rounded-2xl px-4 py-2.5 outline-none text-zinc-900 dark:text-white min-w-0 max-w-full sm:max-w-[180px]"
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
            className="glass rounded-3xl p-6 hover:scale-[1.01] transition-transform"
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

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center py-20 text-zinc-600 dark:text-zinc-400">Loading...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}