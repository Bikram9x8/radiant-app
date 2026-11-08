import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/home/home.module.css";
import Hero from "@/components/home/Hero";
import PathCards from "@/components/home/PathCards";
import ChapterChips from "@/components/home/ChapterChips";
import ScoreCard from "@/components/home/ScoreCard";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import JoinBanner from "@/components/home/JoinBanner";
import AdSlot from "@/components/home/AdSlot";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const latestOpportunities = await prisma.opportunity.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: { select: { name: true } } },
  });

  return (
    <div className={`${fredoka.variable} ${nunito.variable} ${s.home} flex-1`}>
      <Hero />

      {/* Ad slot 1 (moved below the hero so the headline comes first) */}
      <div className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-8 md:pb-10">
        <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
      </div>

      <PathCards />

      {/* Ad slot 2 */}
      <div className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-8 md:pb-10">
        <AdSlot label="970 × 120 banner space" className="h-[120px] max-w-[970px]" />
      </div>

      <ChapterChips />
      <ScoreCard />
      <RecentlyAdded items={latestOpportunities} />
      <JoinBanner />
    </div>
  );
}
