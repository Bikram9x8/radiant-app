// Plain, serialisable shapes of VERIFIED colleges and courses for the pages (server and client).
// internalNotes is never part of these: it is left out in the database query itself.

/** Where a fact group comes from: its official page and the date it was checked (YYYY-MM-DD) */
export type SourceRef = { url: string; checked: string | null };

export type CourseView = {
  courseId: string;
  name: string;
  level: string | null;
  stream: string | null;
  specialization: string | null;
  durationYears: number | null;
  mode: string | null;
  seats: number | null;
  feePerYearInr: number | null;
  feePerSemesterInr: number | null;
  totalFeeInr: number | null;
  feeYear: string | null;
  eligibility: string | null;
  entranceExams: string[];
  src: { course: SourceRef | null; fee: SourceRef | null; eligibility: SourceRef | null; exams: SourceRef | null };
};

export type CollegeView = {
  slug: string;
  name: string;
  shortName: string | null;
  type: string | null;
  establishedYear: number | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  fullAddress: string | null;
  officialWebsite: string | null;
  approvedBy: string[];
  naacGrade: string | null;
  naacValidUntil: string | null;
  nirfRank: string | null;
  nirfCategory: string | null;
  nirfYear: number | null;
  /** "Yes" / "No"; "Not sure" is treated as not available */
  hostel: string | null;
  campusAreaAcres: number | null;
  admissionPhone: string | null;
  admissionEmail: string | null;
  src: {
    basic: SourceRef | null;
    approval: SourceRef | null;
    naac: SourceRef | null;
    nirf: SourceRef | null;
    facilities: SourceRef | null;
    contact: SourceRef | null;
  };
  courses: CourseView[];
};
