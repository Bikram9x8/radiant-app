import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Class 12 - Physics", slug: "class-12-physics" },
    { name: "Class 12 - Chemistry", slug: "class-12-chemistry" },
    { name: "Class 12 - Mathematics", slug: "class-12-mathematics" },
    { name: "Class 12 - Biology", slug: "class-12-biology" },
    { name: "Class 12 - English", slug: "class-12-english" },
    { name: "JEE", slug: "jee" },
    { name: "NEET", slug: "neet" },
    { name: "CUET", slug: "cuet" },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      console.log(`Skipping (already exists): ${cat.name}`);
      continue;
    }
    const created = await prisma.category.create({ data: cat });
    console.log(`Created: ${created.name} (${created.id})`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
