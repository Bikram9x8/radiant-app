import "dotenv/config";
import { prisma } from "../lib/prisma";

const MAIN: { name: string; subs: string[] }[] = [
  {
    name: "Colleges & Courses",
    subs: [
      "Top Colleges",
      "Search Colleges",
      "Engineering Colleges",
      "Medical Colleges",
      "Management Colleges",
      "Commerce & Finance Colleges",
      "Arts & Humanities Colleges",
      "Design & Architecture Colleges",
      "Law Colleges",
      "Science Colleges",
      "Hotel Management & Aviation",
      "Compare Colleges",
      "College Rankings",
      "Admission Guide",
      "Course Explorer",
    ],
  },
  {
    name: "Scholarships",
    subs: [
      "Government Scholarships",
      "Private Scholarships",
      "Merit-Based Scholarships",
      "Need-Based Scholarships",
      "Minority Scholarships",
      "Girl Child Scholarships",
      "Study Abroad Scholarships",
      "State-wise Scholarships",
      "Scholarship Calendar",
      "How to Apply",
    ],
  },
  {
    name: "Internships",
    subs: [
      "Engineering Internships",
      "Medical & Health Internships",
      "Management Internships",
      "Commerce & Finance Internships",
      "Computer & IT Internships",
      "Design & Creative Internships",
      "Law Internships",
      "Science Internships",
      "Virtual Internships",
      "Paid Internships",
      "Summer Internships",
      "Winter Internships",
      "Internship by Company",
      "How to Get Internship",
    ],
  },
  {
    name: "Jobs & Careers",
    subs: [
      "Fresher Jobs",
      "Engineering Jobs",
      "Management Jobs",
      "Commerce & Finance Jobs",
      "IT & Software Jobs",
      "Government Jobs",
      "Campus Placements",
      "Career Paths",
      "Skill Courses for Jobs",
      "Resume & Interview Prep",
      "Job by Location",
      "Work From Home Jobs",
    ],
  },
  {
    name: "Exams & Preparation",
    subs: [
      "Engineering Entrance",
      "Medical Entrance",
      "Management Entrance",
      "Law Entrance",
      "Government Exam Prep",
      "Mock Tests",
      "Previous Year Papers",
      "Exam Calendar",
    ],
  },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let created = 0;
let existed = 0;
let moved = 0;

// Finds a node by parent + slug. Creates it only if it does not exist.
async function ensureNode(parentId: string, name: string, kind: string, position: number) {
  const slug = slugify(name);
  const existing = await prisma.courseNode.findFirst({ where: { parentId, slug } });
  if (existing) {
    existed++;
    return existing;
  }
  created++;
  return prisma.courseNode.create({
    data: { parentId, name, slug, kind, position, isActive: true },
  });
}

async function main() {
  const root = await prisma.courseNode.findFirst({
    where: { parentId: null, slug: "higher-education" },
  });
  if (!root) {
    console.log("Higher Education root not found. Run seed-higher-education.ts first.");
    return;
  }

  const levels = await prisma.courseNode.findMany({
    where: { parentId: root.id },
    orderBy: { position: "asc" },
  });

  const mainSlugs = MAIN.map((m) => slugify(m.name));

  for (const level of levels) {
    console.log(`\n${level.name}`);

    for (let i = 0; i < MAIN.length; i++) {
      const main = await ensureNode(level.id, MAIN[i].name, "STAGE", i + 1);
      for (let j = 0; j < MAIN[i].subs.length; j++) {
        await ensureNode(main.id, MAIN[i].subs[j], "SUBJECT", j + 1);
      }
      console.log(`  ${MAIN[i].name}: ${MAIN[i].subs.length} subcategories checked`);
    }

    // Move the old field categories into Colleges & Courses > Course Explorer
    const colleges = await prisma.courseNode.findFirst({
      where: { parentId: level.id, slug: slugify("Colleges & Courses") },
    });
    const explorer = colleges
      ? await prisma.courseNode.findFirst({
          where: { parentId: colleges.id, slug: slugify("Course Explorer") },
        })
      : null;

    if (explorer) {
      const oldFields = await prisma.courseNode.findMany({
        where: { parentId: level.id, kind: "STAGE", slug: { notIn: mainSlugs } },
      });
      for (const f of oldFields) {
        await prisma.courseNode.update({ where: { id: f.id }, data: { parentId: explorer.id } });
        moved++;
        console.log(`  moved to Course Explorer: ${f.name}`);
      }
    }
  }

  // Count everything under Higher Education
  let total = 1;
  let frontier = [root.id];
  while (frontier.length > 0) {
    const kids = await prisma.courseNode.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    total += kids.length;
    frontier = kids.map((k) => k.id);
  }

  console.log(`\nCreated: ${created}, already existed: ${existed}, moved: ${moved}`);
  console.log(`Higher Education tree now has ${total} nodes (expected 223 on a clean run).`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));
  