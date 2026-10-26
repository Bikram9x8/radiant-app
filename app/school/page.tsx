import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ClassTiles from "@/components/ClassTiles";
import { SchoolArt } from "@/components/Illustrations";
export const dynamic = "force-dynamic";

// How many classes are shown before the "Show all" button
const VISIBLE_CLASSES = 6;

const TILE_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-green-100 text-green-700",
];

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

export default async function SchoolPage() {
  const boards = await prisma.courseNode.findMany({
    where: { kind: "COURSE", isActive: true, slug: { in: ["cbse", "icse"] } },
    orderBy: { position: "asc" },
    include: {
      children: { where: { isActive: true }, orderBy: { position: "asc" } },
    },
  });

  // Every other course (Competitions, Vocational...) except Higher Education
  const others = await prisma.courseNode.findMany({
    where: {
      kind: "COURSE",
      isActive: true,
      slug: { notIn: ["cbse", "icse", "higher-education"] },
    },
    orderBy: { position: "asc" },
    include: {
      children: { where: { isActive: true }, orderBy: { position: "asc" } },
    },
  });

  return (
    <div className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-6 pt-4">
        <AdSlot label="728 × 90 banner space" className="max-w-[728px] h-[90px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <nav className="text-sm text-zinc-500 flex flex-wrap items-center gap-x-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">School Education</span>
        </nav>

        <div className="mt-4 rounded-2xl pastel-purple p-6 sm:p-8 flex flex-wrap items-center gap-4">
          <div className="flex-1 basis-[240px] min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14142b]">
              School Education
            </h1>
            <p className="mt-2 text-zinc-700">
              Pick your board and class. Everything inside is arranged as class, subject, chapter.
            </p>
          </div>
          <SchoolArt className="w-44 sm:w-56 h-auto mx-auto" />
        </div>

        {boards.length === 0 && (
          <p className="mt-6 text-sm text-zinc-500">Courses are being set up. Check back soon.</p>
        )}

        {boards.map((board) => {
          // Highest class first
          const levels = [...board.children].reverse();
          const items = levels.map((level, i) => ({
            id: level.id,
            href: `/courses/${board.slug}/${level.slug}`,
            name: level.name,
            label: board.name,
            color: TILE_COLORS[i % TILE_COLORS.length],
          }));

          return (
            <div key={board.id} className="mt-10">
              <h2 className="text-xl font-bold text-[#14142b]">{board.name}</h2>
              <ClassTiles items={items} visible={VISIBLE_CLASSES} />
            </div>
          );
        })}

        {others.length > 0 && (
          <div className="mt-14 pt-10 border-t border-zinc-200">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#14142b]">
              Competitions &amp; Vocational
            </h2>
            <p className="mt-2 text-zinc-600">Exams, contests and skill courses beyond the classroom.</p>

            {others.map((course) => {
              const items = course.children.map((child, i) => ({
                id: child.id,
                href: `/courses/${course.slug}/${child.slug}`,
                name: child.name,
                label: course.slug === "competitive" ? "Competitions" : course.name,
                color: TILE_COLORS[(i + 2) % TILE_COLORS.length],
              }));

              return (
                <div key={course.id} className="mt-8">
                  <h3 className="text-xl font-bold text-[#14142b]">
                    {course.slug === "competitive" ? "Competitions" : course.name}
                  </h3>
                  {items.length > 0 ? (
                    <ClassTiles items={items} visible={items.length} />
                  ) : (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="mt-4 inline-block rounded-2xl bg-violet-100 text-violet-700 px-6 py-4 font-bold hover:-translate-y-0.5 hover:shadow-md transition-all"
                    >
                      Open {course.name} →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}