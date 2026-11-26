// Marks one college (and by default all its courses) as VERIFIED, so it shows on the site.
//
//   Dry run (default, reads only):
//     npx tsx scripts/verify-college.ts --db .env.neon-test amity-university-mohali
//   Write:
//     npx tsx scripts/verify-college.ts --db .env.neon-test amity-university-mohali --write
//   Options:
//     --college-only   verify the college but leave every course as it is (e.g. DRAFT until a fee is confirmed)
//     --course <id>    verify the college (if not already) and ONLY this course; repeat for more courses
//                      (e.g. --course btech-cse --course bca). Every other course stays as it is.
//     --main           required, with approval, to write to the live database (same host as .env)
//
// Before verifying, every filled-in fact group is checked again for its source URL and checked date.
// Any problem blocks --write.

import { openDb } from "./lib/db-target";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const ALLOW_MAIN = args.includes("--main");
const COLLEGE_ONLY = args.includes("--college-only");
const dbIdx = args.indexOf("--db");
const dbFile = dbIdx >= 0 ? args[dbIdx + 1] : undefined;
// Every value after --course is a course_id (the option can be given more than once)
const courseIdx = args.flatMap((a, i) => (a === "--course" ? [i + 1] : []));
const ONLY_COURSES = courseIdx.map((i) => args[i]);
const slug = args.find((a, i) => !a.startsWith("--") && i !== dbIdx + 1 && !courseIdx.includes(i));
if (!dbFile || !slug || ONLY_COURSES.some((k) => !k || k.startsWith("--")) || (COLLEGE_ONLY && ONLY_COURSES.length)) {
  console.error(
    "Usage: npx tsx scripts/verify-college.ts --db <env file> <college_id> [--college-only | --course <course_id> ...] [--write [--main]]",
  );
  process.exit(1);
}

type Group = { label: string; values: unknown[]; src: string | null; date: Date | null };
const filled = (v: unknown) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0);

function problems(where: string, groups: Group[]) {
  const out: string[] = [];
  for (const g of groups) {
    if (!g.values.some(filled)) continue;
    if (!g.src?.startsWith("https://")) out.push(`${where}: ${g.label} has no https:// source`);
    if (!g.date) out.push(`${where}: ${g.label} has no checked date`);
  }
  return out;
}

async function main() {
  const prisma = openDb(dbFile!, { write: WRITE, allowMain: ALLOW_MAIN });
  try {
    const c = await prisma.college.findUnique({ where: { slug: slug! }, include: { courses: { orderBy: { courseId: "asc" } } } });
    if (!c) throw new Error(`No college "${slug}" in this database (import it first)`);

    const issues = [
      ...(c.name ? [] : [`${c.slug}: name is empty`]),
      ...problems(c.slug, [
        { label: "Basic info", values: [c.city, c.state, c.pincode, c.fullAddress, c.officialWebsite], src: c.basicInfoSourceUrl, date: c.basicInfoCheckedAt },
        { label: "Approval", values: [c.type, c.establishedYear, c.district, c.approvedBy], src: c.approvalSourceUrl, date: c.approvalCheckedAt },
        { label: "NAAC", values: [c.naacGrade, c.naacValidUntil], src: c.naacSourceUrl, date: c.naacCheckedAt },
        { label: "NIRF", values: [c.nirfRank, c.nirfCategory, c.nirfYear], src: c.nirfSourceUrl, date: c.nirfCheckedAt },
        { label: "Facilities", values: [c.hostel, c.campusAreaAcres], src: c.facilitiesSourceUrl, date: c.facilitiesCheckedAt },
        { label: "Contact", values: [c.admissionPhone, c.admissionEmail], src: c.contactSourceUrl, date: c.contactCheckedAt },
      ]),
    ];
    const unknown = ONLY_COURSES.filter((id) => !c.courses.some((k) => k.courseId === id));
    if (unknown.length) throw new Error(`${c.slug} has no course ${unknown.map((id) => `"${id}"`).join(", ")} in this database`);
    const chosen = (k: { courseId: string }) => (ONLY_COURSES.length ? ONLY_COURSES.includes(k.courseId) : !COLLEGE_ONLY);
    const courses = c.courses.filter(chosen);
    // With --course, an already VERIFIED college is left as it is (its verified date is kept)
    const updateCollege = !(ONLY_COURSES.length && c.status === "VERIFIED");
    for (const k of courses) {
      const where = `${c.slug}/${k.courseId}`;
      issues.push(
        ...problems(where, [
          { label: "Course details", values: [k.level, k.stream, k.specialization, k.durationYears, k.mode, k.seats], src: k.courseSourceUrl, date: k.courseCheckedAt },
          { label: "Fees", values: [k.feePerYearInr, k.feePerSemesterInr, k.totalFeeInr], src: k.feeSourceUrl, date: k.feeCheckedAt },
          { label: "Eligibility", values: [k.eligibility], src: k.eligibilitySourceUrl, date: k.courseCheckedAt },
          { label: "Entrance exams", values: [k.entranceExams], src: k.examSourceUrl, date: k.courseCheckedAt },
        ]),
      );
    }

    console.log(`\n# Verify ${c.slug}: ${WRITE ? "WRITE" : "DRY RUN"}\n`);
    console.log(`- College: ${c.name} (now ${c.status}) → ${updateCollege ? "VERIFIED" : "unchanged"}`);
    for (const k of c.courses) console.log(`- Course ${k.courseId}: ${k.name} (now ${k.status}) → ${chosen(k) ? "VERIFIED" : "unchanged"}`);
    console.log(`\nProblems: ${issues.length ? "\n- " + issues.join("\n- ") : "none"}`);

    if (!WRITE) return console.log("\nDRY RUN: nothing was written. Re-run with --write to verify.");
    if (issues.length) {
      process.exitCode = 1;
      return console.error("\nNot written: fix the problems above first.");
    }
    const now = new Date();
    await prisma.$transaction([
      ...(updateCollege ? [prisma.college.update({ where: { id: c.id }, data: { status: "VERIFIED", verifiedAt: now } })] : []),
      ...courses.map((k) => prisma.course.update({ where: { id: k.id }, data: { status: "VERIFIED", verifiedAt: now } })),
    ]);
    console.log(
      `\nWritten: ${updateCollege ? `${c.slug} and ` : `${c.slug} was already VERIFIED; `}${courses.length} course(s) are VERIFIED.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e).replace(/postgres(ql)?:\/\/\S+/g, "<url hidden>"));
  process.exit(1);
});
