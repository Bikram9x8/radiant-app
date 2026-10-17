// Seeds the CourseNode tree. Safe to run more than once (it updates existing nodes, never duplicates).
//
//   Preview only (no database touched):   npx tsx prisma/seed-course-tree.ts --dry-run
//   Write to the database:                npx tsx prisma/seed-course-tree.ts

import "dotenv/config";
import { COURSES, type SeedNode } from "./seed-data/course-tree";

type FlatNode = {
  path: string; // e.g. "cbse/class-12/physics/chapter-2"
  parentPath: string | null;
  name: string;
  slug: string;
  kind: string;
  position: number;
  chapterNo: number | null;
  bookName: string | null;
  tags: string[];
  contentTypes: string[];
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function flatten(nodes: SeedNode[], parentPath: string | null, out: FlatNode[]) {
  nodes.forEach((n, i) => {
    const slug = slugify(n.name);
    const path = parentPath ? `${parentPath}/${slug}` : slug;
    out.push({
      path,
      parentPath,
      name: n.name,
      slug,
      kind: n.kind,
      position: i,
      chapterNo: null,
      bookName: n.bookName ?? null,
      tags: n.tags ?? [],
      contentTypes: n.contentTypes ?? [],
    });
    if (n.children) flatten(n.children, path, out);
    if (n.chapters) {
      n.chapters.forEach((title, j) => {
        out.push({
          path: `${path}/chapter-${j + 1}`,
          parentPath: path,
          name: title,
          slug: `chapter-${j + 1}`,
          kind: "CHAPTER",
          position: j,
          chapterNo: j + 1,
          bookName: null,
          tags: [],
          contentTypes: [],
        });
      });
    }
  });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const flat: FlatNode[] = [];
  flatten(COURSES, null, flat);

  // Sanity check: no two siblings may share a slug
  const seen = new Set<string>();
  for (const f of flat) {
    if (seen.has(f.path)) throw new Error(`Duplicate path in seed data: ${f.path}`);
    seen.add(f.path);
  }

  const counts: Record<string, number> = {};
  flat.forEach((f) => (counts[f.kind] = (counts[f.kind] || 0) + 1));
  console.log(`Seed contains ${flat.length} nodes:`, counts);

  if (dryRun) {
    console.log("Dry run only. Nothing was written.");
    return;
  }

  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const idByPath = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (let i = 0; i < flat.length; i++) {
    const f = flat[i];
    const parentId = f.parentPath ? idByPath.get(f.parentPath)! : null;
    const data = {
      name: f.name,
      kind: f.kind,
      position: f.position,
      chapterNo: f.chapterNo,
      bookName: f.bookName,
      tags: f.tags,
      contentTypes: f.contentTypes,
    };

    const existing = await prisma.courseNode.findFirst({ where: { parentId, slug: f.slug } });
    if (existing) {
      await prisma.courseNode.update({ where: { id: existing.id }, data });
      idByPath.set(f.path, existing.id);
      updated++;
    } else {
      const row = await prisma.courseNode.create({ data: { ...data, slug: f.slug, parentId } });
      idByPath.set(f.path, row.id);
      created++;
    }
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1} / ${flat.length}`);
  }

  console.log(`Done. Created ${created}, updated ${updated}.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
