// Reads VERIFIED colleges and their VERIFIED courses from the database (server only).
// Draft rows never leave this file, and internalNotes is omitted in the query itself.
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { CollegeView, CourseView, SourceRef } from "./types";

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
const num = (d: { toString(): string } | null) => (d === null ? null : Number(d.toString()));
const src = (url: string | null, checked: Date | null): SourceRef | null => (url ? { url, checked: iso(checked) } : null);

const QUERY = {
  where: { status: "VERIFIED" as const },
  omit: { internalNotes: true },
  include: {
    courses: {
      where: { status: "VERIFIED" as const },
      omit: { internalNotes: true },
      orderBy: { name: "asc" as const }, // then sorted by level below (UG first)
    },
  },
};

type Row = Awaited<ReturnType<typeof loadRows>>[number];
function loadRows() {
  return prisma.college.findMany({ ...QUERY, orderBy: { name: "asc" } });
}

// Course order on the page: by level as students move through them, then A to Z
const LEVELS = ["Certificate", "Diploma", "UG", "Integrated", "PG", "PhD"];
const levelRank = (l: string | null) => (l && LEVELS.includes(l) ? LEVELS.indexOf(l) : LEVELS.length);

function toView(c: Row): CollegeView {
  const sorted = [...c.courses].sort((a, b) => levelRank(a.level) - levelRank(b.level));
  const courses: CourseView[] = sorted.map((k) => ({
    courseId: k.courseId,
    name: k.name,
    level: k.level,
    stream: k.stream,
    specialization: k.specialization,
    durationYears: num(k.durationYears),
    mode: k.mode,
    seats: k.seats,
    feePerYearInr: k.feePerYearInr,
    feePerSemesterInr: k.feePerSemesterInr,
    totalFeeInr: k.totalFeeInr,
    feeYear: k.feeYear,
    eligibility: k.eligibility,
    entranceExams: k.entranceExams,
    src: {
      course: src(k.courseSourceUrl, k.courseCheckedAt),
      fee: src(k.feeSourceUrl, k.feeCheckedAt),
      eligibility: src(k.eligibilitySourceUrl, k.courseCheckedAt),
      exams: src(k.examSourceUrl, k.courseCheckedAt),
    },
  }));
  return {
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    type: c.type,
    establishedYear: c.establishedYear,
    city: c.city,
    district: c.district,
    state: c.state,
    pincode: c.pincode,
    fullAddress: c.fullAddress,
    officialWebsite: c.officialWebsite,
    approvedBy: c.approvedBy,
    naacGrade: c.naacGrade,
    naacValidUntil: iso(c.naacValidUntil),
    nirfRank: c.nirfRank,
    nirfCategory: c.nirfCategory,
    nirfYear: c.nirfYear,
    hostel: c.hostel === "Yes" || c.hostel === "No" ? c.hostel : null,
    campusAreaAcres: num(c.campusAreaAcres),
    admissionPhone: c.admissionPhone,
    admissionEmail: c.admissionEmail,
    src: {
      basic: src(c.basicInfoSourceUrl, c.basicInfoCheckedAt),
      approval: src(c.approvalSourceUrl, c.approvalCheckedAt),
      naac: src(c.naacSourceUrl, c.naacCheckedAt),
      nirf: src(c.nirfSourceUrl, c.nirfCheckedAt),
      facilities: src(c.facilitiesSourceUrl, c.facilitiesCheckedAt),
      contact: src(c.contactSourceUrl, c.contactCheckedAt),
    },
    courses,
  };
}

/** All verified colleges (with their verified courses), A to Z */
export const verifiedColleges = cache(async (): Promise<CollegeView[]> => (await loadRows()).map(toView));

/** One verified college by its college_id, or null (draft or unknown) */
export const getVerifiedCollege = cache(async (slug: string): Promise<CollegeView | null> => {
  const row = await prisma.college.findFirst({ ...QUERY, where: { ...QUERY.where, slug } });
  return row ? toView(row) : null;
});
