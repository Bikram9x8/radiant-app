// Links existing posts (Opportunity) to the new course tree (CourseNode chapters).
//
//   Preview only (changes nothing):   npx tsx prisma/link-opportunities.ts
//   Save the links to the database:   npx tsx prisma/link-opportunities.ts --apply

import "dotenv/config";

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");

const SUBJECT_ALIASES: Record<string, string> = {
  maths: "mathematics",
  math: "mathematics",
  sst: "socialscience",
  socialstudies: "socialscience",
  evs: "environmentalstudies",
  cs: "computerscience",
  bio: "biology",
  phy: "physics",
  chem: "chemistry",
};

// Which post division becomes which content type inside a chapter.
// Divisions not listed here are not chapter based, so they are skipped.
const DIVISION_TO_TYPE: Record<string, string> = {
  NCERT_SOLUTION: "SOLUTION",
  CHAPTER_WISE_TEST: "TEST",
  DPP: "DPP",
  STUDY_PACKAGE: "NOTES",
};

async function main() {
  const apply = process.argv.includes("--apply");

  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const nodes = await prisma.courseNode.findMany({ where: { isActive: true } });
  const byParent = new Map<string | null, typeof nodes>();
  for (const n of nodes) {
    const list = byParent.get(n.parentId) ?? [];
    list.push(n);
    byParent.set(n.parentId, list);
  }
  const cbse = nodes.find((n) => n.kind === "COURSE" && n.slug === "cbse");
  if (!cbse) throw new Error("CBSE course not found in the course tree.");

  const opps = await prisma.opportunity.findMany({
    where: { courseNodeId: null, type: { not: "INTERNSHIP" } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Posts not yet linked: ${opps.length}`);
  console.log(apply ? "MODE: APPLY (saving links)\n" : "MODE: PREVIEW (nothing is saved)\n");

  const matched: { id: string; courseNodeId: string; contentType: string }[] = [];
  const skipped: Record<string, string[]> = {};
  const skip = (reason: string, line: string) => {
    (skipped[reason] ??= []).push(line);
  };

  for (const o of opps) {
    const catName = o.category?.name ?? "";
    const label = `${catName} | ch ${o.chapter ?? "-"} | ${o.division} | ${o.title}`;

    let contentType = DIVISION_TO_TYPE[o.division as string];
    if (!contentType && o.division === "TEST_SERIES" && o.chapter != null) contentType = "TEST";
    if (!contentType) {
      skip(`Division ${o.division} is not chapter based`, label);
      continue;
    }

    const m = catName.match(/^Class\s*(\d{1,2})\s*-\s*(.+)$/i);
    if (!m) {
      skip("Category name is not like 'Class 10 - Maths'", label);
      continue;
    }
    const classSlug = `class-${parseInt(m[1], 10)}`;
    const subjectKey = SUBJECT_ALIASES[norm(m[2])] ?? norm(m[2]);

    const level = (byParent.get(cbse.id) ?? []).find((n) => n.slug === classSlug);
    if (!level) {
      skip(`No ${classSlug} in the course tree`, label);
      continue;
    }

    const subject = (byParent.get(level.id) ?? []).find((n) => norm(n.name) === subjectKey);
    if (!subject) {
      skip(`No subject '${m[2].trim()}' under ${level.name}`, label);
      continue;
    }

    if (o.chapter == null) {
      skip("Post has no chapter number", label);
      continue;
    }

    let chapterNo: number = o.chapter;
    if (level.slug === "class-10" && subject.slug === "mathematics") {
      // Older posts use the old book numbering, where Constructions was chapter 11.
      if (chapterNo === 11) {
        skip("Class 10 Maths chapter 11 (Constructions) is not in the new book", label);
        continue;
      }
      if (chapterNo >= 12) chapterNo = chapterNo - 1;
    }
    const chapter = (byParent.get(subject.id) ?? []).find((n) => n.chapterNo === chapterNo);
    if (!chapter) {
      skip(`No chapter ${o.chapter} seeded under ${level.name} ${subject.name}`, label);
      continue;
    }

    matched.push({ id: o.id, courseNodeId: chapter.id, contentType });
    console.log(
      `OK   | ${level.name} ${subject.name} | ch ${o.chapter} -> "${chapter.name}" | ${contentType} | ${o.title}`
    );
  }

  console.log("\n---------- SKIPPED ----------");
  for (const [reason, lines] of Object.entries(skipped)) {
    console.log(`\n${reason} (${lines.length}):`);
    lines.slice(0, 15).forEach((l) => console.log("   " + l));
    if (lines.length > 15) console.log(`   ... and ${lines.length - 15} more`);
  }

  const skippedTotal = Object.values(skipped).reduce((a, l) => a + l.length, 0);
  console.log(`\nSummary: ${matched.length} would be linked, ${skippedTotal} skipped.`);

  if (apply) {
    for (const x of matched) {
      await prisma.opportunity.update({
        where: { id: x.id },
        data: { courseNodeId: x.courseNodeId, contentType: x.contentType },
      });
    }
    console.log(`Saved ${matched.length} links.`);
  } else {
    console.log("Preview only. Nothing was changed. Add --apply to save.");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
