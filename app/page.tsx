import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { absoluteUrl } from "@/lib/site";
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
import AdSlot, { ADS_ENABLED } from "@/components/AdSlot";
import { SHOW_ABROAD, SHOW_SCHOOL } from "@/lib/features";
import { getCountry, getExam, verifiedScholarships } from "@/lib/abroad";
import { notSchoolWhere } from "@/lib/school-posts";
import { endedTestWhere } from "@/lib/test-posts";

const HOME_TITLE = "Radiant Educations: colleges, entrance exams and updates after Class 12";
const HOME_DESCRIPTION =
  "Compare colleges in Punjab and Tricity, check entrance exams and follow the latest admission updates. Every fact links to its official source.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { type: "website", url: absoluteUrl("/"), title: HOME_TITLE, description: HOME_DESCRIPTION, siteName: "Radiant Educations", locale: "en_IN" },
};

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
    // Ended tests are left out too (lib/test-posts.ts); AND keeps notSchoolWhere's own NOT intact
    where: { status: "APPROVED", ...(SHOW_SCHOOL ? {} : notSchoolWhere), AND: [{ NOT: endedTestWhere() }] },
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
    process.env.NEXT_PUBLIC_SHOW_UPDATES === "true" ? await (await import("@/lib/updates/data")).latestUpdates(4) : null;

  // Colleges are live (SHOW_COLLEGES on): the hero finder and the college cards use the real VERIFIED
  // colleges, and the empty ad boxes are hidden until a real ad exists. Written on process.env itself so
  // the bundler drops the finder's client code while the switch is off (the homepage is then unchanged).
  const collegesLive = process.env.NEXT_PUBLIC_SHOW_COLLEGES === "true";
  const colleges = collegesLive ? await (await import("@/lib/colleges/data")).verifiedColleges() : null;
  // Exams that have a college page, for the exam band's links (only while Colleges is live)
  const liveExams = colleges ? (await import("@/lib/colleges/exams")).examsInUse(colleges).map((e) => e.slug) : null;
  const CollegeFinderPass = collegesLive ? (await import("@/components/landing/CollegeFinderPass")).default : null;

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
      <Hero finder={CollegeFinderPass && colleges ? <CollegeFinderPass colleges={colleges} /> : undefined} />
      <CampusScene />
      <Ticker extra={abroadWords} />

      {/* Ad slot 1, below the hero (only once a real ad exists, and not while Colleges is live) */}
      {ADS_ENABLED && !collegesLive && (
        <div className={`${s.wrap} ${s.adRow}`}>
          <AdSlot label="728 × 90 banner space" className="h-[90px] max-w-[728px]" />
        </div>
      )}

      {HomeWithUpdates ? (
        <HomeWithUpdates items={updates?.items ?? []} total={updates?.total ?? 0}>
          <JourneyCards abroad={SHOW_ABROAD} />
        </HomeWithUpdates>
      ) : (
        <JourneyCards abroad={SHOW_ABROAD} />
      )}
      <CourseChips />
      {colleges ? <CollegeCards live={colleges} /> : <CollegeCards />}

      {/* Ad slot 2, between the cards and the exams band (same rule) */}
      {ADS_ENABLED && !collegesLive && (
        <div className={`${s.wrap} ${s.adRow}`}>
          <AdSlot label="970 × 120 banner space" className="h-[120px] max-w-[970px]" />
        </div>
      )}

      {liveExams ? <ExamsBand live={liveExams} /> : <ExamsBand />}
      {AbroadBand && <AbroadBand />}
      {collegesLive ? <RecentlyAdded items={latestOpportunities} hideAd /> : <RecentlyAdded items={latestOpportunities} />}
      <CareerBlock />
      <Guides />
      <JoinBanner />
      <RevealOnScroll />
    </div>
  );
}
