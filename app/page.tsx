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
import RevealOnScroll from "@/components/landing/RevealOnScroll";
import AdSlot from "@/components/AdSlot";
import { SHOW_ABROAD, SHOW_SCHOOL } from "@/lib/features";
import { getCountry, getExam, verifiedScholarships } from "@/lib/abroad";
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

  // Loaded only when Study Abroad is on, so its styles are not added to the homepage while it is off
  const AbroadBand = SHOW_ABROAD ? (await import("@/components/landing/AbroadBand")).default : null;

  // Latest updates panel: loaded only while the switch is on, so the homepage is exactly the same as
  // before while it is off. The condition is written on process.env itself (not SHOW_UPDATES): that
  // value is fixed at build time, so the bundler drops these imports, and their stylesheet, when off.
  const HomeWithUpdates =
    process.env.NEXT_PUBLIC_SHOW_UPDATES === "true" ? (await import("@/components/updates/HomeWithUpdates")).default : null;
  const updates =
    process.env.NEXT_PUBLIC_SHOW_UPDATES === "true" ? await (await import("@/lib/updates/data")).latestUpdates(6) : [];

  // Study Abroad words for the ticker: only verified items, none while it is switched off
  const abroadWords = SHOW_ABROAD
    ? [
        getCountry("uk") && "Study in UK",
        getCountry("canada") && "Study in Canada",
        getExam("ielts") && "IELTS",
        verifiedScholarships().some((x) => x.slug === "chevening") && "Chevening",
      ].filter((w): w is string => typeof w === "string")
    : [];

  return (
    <div className={`${s.landing} flex-1`}>
      <Hero />
      <CampusScene />
      <Ticker extra={abroadWords} />

      {/* Ad slot 1, below the hero */}
      <div className={`${s.wrap} ${s.adRow}`}>
        <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
      </div>

      {HomeWithUpdates ? (
        <HomeWithUpdates items={updates}>
          <JourneyCards abroad={SHOW_ABROAD} />
        </HomeWithUpdates>
      ) : (
        <JourneyCards abroad={SHOW_ABROAD} />
      )}
      <CourseChips />
      <CollegeCards />

      {/* Ad slot 2, between the cards and the exams band */}
      <div className={`${s.wrap} ${s.adRow}`}>
        <AdSlot label="970 × 120 banner space" className="h-[120px] max-w-[970px]" />
      </div>

      <ExamsBand />
      {AbroadBand && <AbroadBand />}
      <RecentlyAdded items={latestOpportunities} />
      <CareerBlock />
      <Guides />
      <JoinBanner />
      <RevealOnScroll />
    </div>
  );
}
