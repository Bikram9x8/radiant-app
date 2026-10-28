// Idempotent: creates the "Internships" Category if it doesn't exist.
// Dry run by default; pass --apply to write.
//   npx tsx prisma/seed-internships-category.ts
//   npx tsx prisma/seed-internships-category.ts --apply
import "dotenv/config";
import { prisma } from "../lib/prisma";

const CATEGORY = { name: "Internships", slug: "internships", description: null };
const apply = process.argv.includes("--apply");

async function main() {
  console.log(apply ? "Mode: APPLY (will write)" : "Mode: DRY RUN (no writes)");

  const existing = await prisma.category.findFirst({
    where: { OR: [{ slug: CATEGORY.slug }, { name: CATEGORY.name }] },
  });

  if (existing) {
    console.log(`Skipping (already exists): ${existing.name} [${existing.slug}] (${existing.id})`);
  } else if (!apply) {
    console.log(`Would create: ${CATEGORY.name} [${CATEGORY.slug}], description: null`);
  } else {
    const created = await prisma.category.create({ data: CATEGORY });
    console.log(`Created: ${created.name} [${created.slug}] (${created.id})`);
  }

  const total = await prisma.opportunity.count();
  const linked = await prisma.opportunity.count({ where: { courseNodeId: { not: null } } });
  console.log(`Opportunity rows: ${total} total, ${linked} with courseNodeId (baseline 64 / 47)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
