import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HigherTabs from "@/components/HigherTabs";
import { HigherArt } from "@/components/Illustrations";
import AdSlot, { ADS_ENABLED } from "@/components/AdSlot";
import s from "@/components/school/school.module.css";
import ComingSoon from "@/components/ComingSoon";
export const dynamic = "force-dynamic";

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
    <div className={`${s.page} flex-1`}>
      {/* Ad banner: only once a real ad exists (components/AdSlot.tsx) */}
      {ADS_ENABLED && (
        <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-8">
          <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-14 sm:px-8 md:pt-8">
        <nav
          aria-label="Breadcrumb"
          className={`${s.crumbs} flex flex-wrap items-center gap-x-2 text-[15px] font-bold text-(--hp-muted)`}
        >
          <Link href="/" className="inline-flex min-h-11 items-center">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-(--hp-ink)">Higher Education</span>
        </nav>

        {/* Hero card */}
        <div className="mt-3 flex flex-wrap items-center gap-6 rounded-[18px] border border-(--line) bg-(--hp-mint) p-6 shadow-soft sm:p-8 md:rounded-[18px] md:p-10">
          <div className="min-w-0 flex-1 basis-[260px]">
            <h1 className={`${s.display} m-0 text-[38px] leading-[1.1] font-bold sm:text-[46px] md:text-[56px]`}>
              Higher <span className={s.ser}>Education</span>
            </h1>
            <p className="mt-3 max-w-[46ch] text-[17px] leading-[1.55] font-semibold md:text-lg">
              Choose where you are in your studies, then pick what you need.
            </p>
          </div>
          <HigherArt className="mx-auto h-auto w-40 sm:w-52" />
        </div>

        {!root && (
          <div className="mt-8">
            <ComingSoon back={{ href: "/", label: "Home" }} />
          </div>
        )}

        {root && (
          <div className="mt-10">
            <HigherTabs rootSlug={root.slug} stages={stages} />
          </div>
        )}
      </div>
    </div>
  );
}
