import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HigherTabs from "@/components/HigherTabs";
export const dynamic = "force-dynamic";

function AdSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`mx-auto w-full border border-dashed border-zinc-300 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Advertisement</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

export default async function HigherPage() {
  const root = await prisma.courseNode.findFirst({
    where: { parentId: null, slug: "higher-education", isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
        include: {
          children: { where: { isActive: true }, orderBy: { position: "asc" } },
        },
      },
    },
  });

  const stages = root
    ? root.children.map((level) => ({
        id: level.id,
        name: level.name,
        slug: level.slug,
        cards: level.children.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      }))
    : [];

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <AdSlot label="728 × 90 banner space" className="max-w-[728px] h-[90px]" />
      </div>

      <div className="fade-up max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <nav className="text-sm text-zinc-500 flex flex-wrap items-center gap-x-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Higher Education</span>
        </nav>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14142b]">
          Higher Education
        </h1>
        <p className="mt-2 text-zinc-600">
          Choose where you are in your studies, then pick what you need.
        </p>

        {!root && (
          <p className="mt-6 text-sm text-zinc-500">Higher Education is being set up. Check back soon.</p>
        )}

        {root && (
          <div className="mt-8">
            <HigherTabs rootSlug={root.slug} stages={stages} />
          </div>
        )}
      </div>
    </div>
  );
}