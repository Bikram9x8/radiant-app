// Read-only safety check: run after every database step.
// Baseline: 64 total Opportunity rows, 47 with courseNodeId NOT NULL.
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const total = await prisma.opportunity.count();
  const linked = await prisma.opportunity.count({ where: { courseNodeId: { not: null } } });
  const withDuration = await prisma.opportunity.count({ where: { duration: { not: null } } });

  console.log(`Total Opportunity rows:         ${total} (baseline 64)`);
  console.log(`With courseNodeId NOT NULL:     ${linked} (baseline 47)`);
  console.log(`With duration NOT NULL:         ${withDuration}`);
  console.log(linked === 47 ? "OK: linked posts intact" : "WARNING: linked count changed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
