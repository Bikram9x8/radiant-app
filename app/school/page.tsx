import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ClassTiles from "@/components/ClassTiles";
import { SchoolArt } from "@/components/Illustrations";
import AdSlot from "@/components/home/AdSlot";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/school/school.module.css";
import ComingSoon from "@/components/ComingSoon";
export const dynamic = "force-dynamic";

// How many classes are shown before the "Show all" button
const VISIBLE_CLASSES = 6;

// Option B pastels for the class tiles (background only; text stays ink for contrast)
const TILE_COLORS = [
  "bg-(--hp-yellow)",
  "bg-(--hp-mint)",
  "bg-(--hp-lavender)",
  "bg-(--hp-coral)",
  "bg-(--hp-sky)",
  "bg-(--hp-pink)",
];

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
    <div className={`${fredoka.variable} ${nunito.variable} ${s.page} flex-1`}>
      <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-8">
        <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-14 sm:px-8 md:pt-8">
        <nav aria-label="Breadcrumb" className={`${s.crumbs} flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-(--hp-muted)`}>
          <Link href="/" className="inline-flex min-h-11 items-center">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-(--hp-ink)">School Education</span>
        </nav>

        {/* Hero card */}
        <div className="mt-3 flex flex-wrap items-center gap-6 rounded-[28px] border-[3px] border-(--hp-ink) bg-(--hp-lavender) p-6 shadow-[6px_6px_0_var(--hp-ink)] sm:p-8 md:rounded-[36px] md:p-10">
          <div className="min-w-0 flex-1 basis-[260px]">
            <h1 className={`${s.display} m-0 text-[38px] leading-[1.1] font-bold sm:text-[46px] md:text-[56px]`}>
              School Education
            </h1>
            <p className="mt-3 max-w-[46ch] text-[17px] leading-[1.55] font-semibold md:text-lg">
              Pick your board and class. Everything inside is arranged as class, subject, chapter.
            </p>
          </div>
          <SchoolArt className="mx-auto h-auto w-40 sm:w-52" />
        </div>

        {boards.length === 0 && (
          <div className="mt-8">
            <ComingSoon back={{ href: "/", label: "Home" }} />
          </div>
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
            <section key={board.id} className="mt-12" aria-labelledby={`board-${board.id}`}>
              <h2 id={`board-${board.id}`} className={`${s.display} m-0 text-[28px] font-bold md:text-[34px]`}>
                {board.name}
              </h2>
              <ClassTiles items={items} visible={VISIBLE_CLASSES} />
            </section>
          );
        })}

        {others.length > 0 && (
          <div className="mt-16 border-t-[3px] border-dashed border-(--hp-ink)/25 pt-12">
            <h2 className={`${s.display} m-0 text-[30px] leading-tight font-bold md:text-[40px]`}>
              Competitions &amp; Vocational
            </h2>
            <p className="mt-2 text-[17px] font-semibold text-(--hp-muted)">
              Exams, contests and skill courses beyond the classroom.
            </p>

            {others.map((course) => {
              const items = course.children.map((child, i) => ({
                id: child.id,
                href: `/courses/${course.slug}/${child.slug}`,
                name: child.name,
                label: course.slug === "competitive" ? "Competitions" : course.name,
                color: TILE_COLORS[(i + 2) % TILE_COLORS.length],
              }));

              return (
                <div key={course.id} className="mt-9">
                  <h3 className={`${s.display} m-0 text-2xl font-bold md:text-[28px]`}>
                    {course.slug === "competitive" ? "Competitions" : course.name}
                  </h3>
                  {items.length > 0 ? (
                    <ClassTiles items={items} visible={items.length} />
                  ) : (
                    <Link
                      href={`/courses/${course.slug}`}
                      className={`${s.press} mt-4 inline-flex [--radius:999px]`}
                    >
                      <span className={`${s.face} min-h-12 items-center bg-(--hp-lavender) px-6 text-[17px] font-extrabold`}>
                        Open {course.name} →
                      </span>
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
