import Link from "next/link";
import { notFound } from "next/navigation";
import type { CourseNode } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const TILE_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-green-100 text-green-700",
];

const CONTENT_LABELS: Record<string, string> = {
  NOTES: "Notes",
  SOLUTION: "Solutions",
  TEST: "Tests",
  MCQ_TEST: "MCQ Tests",
  PYQ: "PYQ",
  DPP: "DPP",
  MOCK_TEST: "Mock Tests",
  LESSON: "Lessons",
  VIDEO: "Videos",
};

function AdSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`mx-auto w-full border border-dashed border-zinc-300 rounded-lg bg-zinc-50 flex flex-col items-center justify-center text-center ${className}`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Advertisement</span>
      <span className="text-sm text-zinc-500">{label}</span>
    </div>
  );
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;

  // Walk down the tree one slug at a time
  const trail: CourseNode[] = [];
  let parentId: string | null = null;
  for (const s of slug) {
    const node: CourseNode | null = await prisma.courseNode.findFirst({
      where: { parentId, slug: s, isActive: true },
    });
    if (!node) notFound();
    trail.push(node);
    parentId = node.id;
  }

  const current = trail.length > 0 ? trail[trail.length - 1] : null;
  const root = trail.length > 0 ? trail[0] : null;

  const children = await prisma.courseNode.findMany({
    where: { parentId: current ? current.id : null, isActive: true },
    orderBy: { position: "asc" },
  });

  const basePath = "/courses/" + slug.join("/");
  const isChapter = current?.kind === "CHAPTER";
  const chaptersMode = children.length > 0 && children[0].kind === "CHAPTER";
  const title = current ? current.name : "All courses";

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-6 pt-4">
        <AdSlot label="728 × 90 banner space" className="max-w-[728px] h-[90px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/courses" className="hover:underline">Courses</Link>
          {trail.map((n, i) => (
            <span key={n.id} className="flex items-center gap-2">
              <span>/</span>
              {i === trail.length - 1 ? (
                <span className="text-zinc-900 font-semibold">{n.name}</span>
              ) : (
                <Link href={"/courses/" + slug.slice(0, i + 1).join("/")} className="hover:underline">
                  {n.name}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14142b]">{title}</h1>
        {current?.bookName && <p className="mt-2 text-zinc-600">Book: {current.bookName}</p>}

        <div className="mt-8 flex flex-wrap gap-8 items-start">
          <div className="flex-1 basis-[480px] min-w-0">
            {/* Chapter page */}
            {isChapter && root && (
              <div>
                <p className="text-zinc-600">Study material for this chapter</p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(root.contentTypes.length > 0 ? root.contentTypes : ["NOTES", "SOLUTION", "TEST", "MCQ_TEST", "PYQ", "DPP"]).map(
                    (t, i) => (
                      <div
                        key={t}
                        className={`rounded-2xl p-5 ${TILE_COLORS[i % TILE_COLORS.length]}`}
                      >
                        <span className="block text-lg font-extrabold text-[#14142b]">{CONTENT_LABELS[t] ?? t}</span>
                        <span className="block mt-2 text-sm font-semibold opacity-80">Coming soon</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Chapters list */}
            {!isChapter && chaptersMode && (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-200">
                {children.map((c) => (
                  <Link
                    key={c.id}
                    href={`${basePath}/${c.slug}`}
                    className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-zinc-50"
                  >
                    <span className="shrink-0 w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm">
                      {c.chapterNo}
                    </span>
                    <span className="text-base font-semibold text-[#14142b]">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Tiles for courses, classes, subjects */}
            {!isChapter && !chaptersMode && children.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {children.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`${basePath === "/courses/" ? "/courses" : basePath}/${c.slug}`}
                    className={`block rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${TILE_COLORS[i % TILE_COLORS.length]}`}
                  >
                    <span className="block text-xl font-extrabold text-[#14142b]">{c.name}</span>
                    <span className="block mt-3 text-sm font-bold">Open →</span>
                  </Link>
                ))}
              </div>
            )}

            {!isChapter && children.length === 0 && (
              <div className="border border-zinc-200 rounded-2xl p-8 text-center text-zinc-600">
                Chapters for this subject are being added. Check back soon.
              </div>
            )}
          </div>

          <div className="shrink-0 w-full sm:w-[300px]">
            <AdSlot label="300 × 250 box space" className="max-w-full h-[250px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
