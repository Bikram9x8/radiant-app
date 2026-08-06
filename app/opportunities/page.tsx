"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconFileText, IconTool, IconTargetArrow, IconPackage, IconClipboardList, IconSchool, IconBook, IconLock } from "@tabler/icons-react";
import FadeIn from "@/components/FadeIn";

const DIVISION_ICONS: Record<string, { Icon: any; gradient: string; glow: string }> = {
  TEST_SERIES: { Icon: IconFileText, gradient: "from-emerald-400 to-cyan-400", glow: "shadow-[0_0_12px_rgba(52,211,153,0.5)]" },
  SKILL_BUILDING: { Icon: IconTool, gradient: "from-pink-400 to-purple-400", glow: "shadow-[0_0_12px_rgba(244,114,182,0.5)]" },
  CAREER_COUNSELING: { Icon: IconTargetArrow, gradient: "from-cyan-400 to-blue-400", glow: "shadow-[0_0_12px_rgba(34,211,238,0.5)]" },
  STUDY_PACKAGE: { Icon: IconPackage, gradient: "from-lime-400 to-emerald-400", glow: "shadow-[0_0_12px_rgba(163,230,53,0.5)]" },
  DPP: { Icon: IconClipboardList, gradient: "from-amber-400 to-pink-400", glow: "shadow-[0_0_12px_rgba(251,191,36,0.5)]" },
  BOARD_LEVEL_TEST: { Icon: IconSchool, gradient: "from-emerald-400 to-purple-400", glow: "shadow-[0_0_12px_rgba(52,211,153,0.5)]" },
  CHAPTER_WISE_TEST: { Icon: IconBook, gradient: "from-purple-400 to-pink-400", glow: "shadow-[0_0_12px_rgba(192,132,252,0.5)]" },
};

const TYPES = ["JOB", "INTERNSHIP", "COMPETITION", "QUIZ", "HACKATHON", "EVENT"];

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const division = searchParams.get("division") || "";

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

      <div className="flex flex-col gap-6">
        {opportunities.map((op, i) => {
          const divisionStyle = DIVISION_ICONS[op.division] || DIVISION_ICONS.TEST_SERIES;
          const DivIcon = divisionStyle.Icon;
          return (
            <FadeIn key={op.id} delay={i * 60}>
            <Link
              href={`/opportunities/${op.id}`}
              className="glass glass-card rounded-3xl p-6"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${divisionStyle.gradient} ${divisionStyle.glow} flex items-center justify-center`}>
                    <DivIcon size={20} color="white" stroke={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-lg text-zinc-900 dark:text-white">{op.title}</h2>
                      {op.requiresCode && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-zinc-200/70 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-full px-2 py-0.5">
                          <IconLock size={10} stroke={2.5} />
                          Code required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {op.company?.companyName} • {op.category?.name}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-purple-100/70 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 shrink-0">
                  {op.type}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Apply by {new Date(op.applyDeadline).toLocaleDateString()}
              </p>
            </Link>
            </FadeIn>
          );
        })}
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