// Read-only safety check: run after every database step.
// Baseline: 63 total Opportunity rows, 47 with courseNodeId NOT NULL (after Phase 1 cleanup, 2026-11-02).
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const total = await prisma.opportunity.count();
  const linked = await prisma.opportunity.count({ where: { courseNodeId: { not: null } } });
  const withDuration = await prisma.opportunity.count({ where: { duration: { not: null } } });

  console.log(`Total Opportunity rows:         ${total} (baseline 63)`);
  console.log(`With courseNodeId NOT NULL:     ${linked} (baseline 47)`);
  console.log(`With duration NOT NULL:         ${withDuration}`);
  console.log(linked === 47 ? "OK: linked posts intact" : "WARNING: linked count changed!");
  console.log(total === 63 ? "OK: total unchanged" : "WARNING: total count changed!");

  const [questions, tests, links, attempts, answers] = await Promise.all([
    prisma.mcqQuestion.count(),
    prisma.mcqTest.count(),
    prisma.mcqTestQuestion.count(),
    prisma.mcqAttempt.count(),
    prisma.mcqAnswer.count(),
  ]);
  console.log(
    `MCQ rows: ${questions} questions, ${tests} tests, ${links} test links, ${attempts} attempts, ${answers} answers`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
