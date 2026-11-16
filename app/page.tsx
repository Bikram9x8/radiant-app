import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import s from "@/components/landing/landing.module.css";
import Hero from "@/components/landing/Hero";
import CampusScene from "@/components/landing/CampusScene";
import Ticker from "@/components/landing/Ticker";
import JourneyCards from "@/components/landing/JourneyCards";
import CourseChips from "@/components/landing/CourseChips";
import CollegeCards from "@/components/landing/CollegeCards";
import ExamsBand from "@/components/landing/ExamsBand";
import RecentlyAdded from "@/components/landing/RecentlyAdded";
import CareerBlock from "@/components/landing/CareerBlock";
import Guides from "@/components/landing/Guides";
import JoinBanner from "@/components/landing/JoinBanner";
import AdSlot from "@/components/AdSlot";
import { SHOW_SCHOOL } from "@/lib/features";
import { notSchoolWhere } from "@/lib/school-posts";

// Homepage (Phase 2 "Teal + Coral", radiant-design/home-teal-coral.html).
// Logged-in visitors go to their dashboard. Colleges, course chips, guides and the career test are
// sample or "Coming soon" (clearly marked); "Recently added" is real data.
export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  const latestOpportunities = await prisma.opportunity.findMany({
    // School posts are left out while School Education is switched off
    where: { status: "APPROVED", ...(SHOW_SCHOOL ? {} : notSchoolWhere) },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: { select: { name: true } } },
  });

  return (
    <div className={`${s.landing} flex-1`}>
      <Hero />
      <CampusScene />
      <Ticker />

      {/* Ad slot 1, below the hero */}
      <div className={`${s.wrap} ${s.adRow}`}>
        <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
      </div>

      <JourneyCards />
      <CourseChips />
      <CollegeCards />

      {/* Ad slot 2, between the cards and the exams band */}
      <div className={`${s.wrap} ${s.adRow}`}>
        <AdSlot label="970 × 120 banner space" className="h-[120px] max-w-[970px]" />
      </div>

      <ExamsBand />
      <RecentlyAdded items={latestOpportunities} />
      <CareerBlock />
      <Guides />
      <JoinBanner />
    </div>
  );
}
