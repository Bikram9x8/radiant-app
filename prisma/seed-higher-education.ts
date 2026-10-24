import "dotenv/config";
import { prisma } from "../lib/prisma";

const TREE: { name: string; categories: string[] }[] = [
  {
    name: "After 12th",
    categories: [
      "Engineering & Technology",
      "Medical & Health Sciences",
      "Sciences",
      "Computer Applications",
      "Commerce & Finance",
      "Management",
      "Arts & Humanities",
      "Law",
      "Design & Architecture",
      "Hotel, Aviation & Others",
      "Teaching",
    ],
  },
  {
    name: "After Graduation",
    categories: [
      "Management",
      "Engineering",
      "Computer Applications",
      "Sciences",
      "Commerce & Finance",
      "Arts & Humanities",
      "Law",
      "Education",
      "Medical PG",
      "Job-Oriented Diplomas",
      "Government Jobs",
    ],
  },
  {
    name: "After Post Graduation",
    categories: [
      "Ph.D & Research",
      "Teaching & Lectureship",
      "Medical Super-Speciality",
      "Post-Doc & Fellowships",
      "Executive & Certifications",
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

// Finds a node by parent + slug. Creates it only if it does not exist.
// An existing node is never changed.
async function ensureNode(
  parentId: string | null,
  name: string,
  kind: string,
  position: number
) {
  const slug = slugify(name);
  const existing = await prisma.courseNode.findFirst({ where: { parentId, slug } });
  if (existing) {
    console.log(`  exists   : ${kind} ${name}`);
    return existing;
  }
  const created = await prisma.courseNode.create({
    data: { parentId, name, slug, kind, position, isActive: true },
  });
  console.log(`  created  : ${kind} ${name}`);
  return created;
}

async function main() {
  console.log("Higher Education");
  // Position 100 keeps it after the existing courses
  const root = await ensureNode(null, "Higher Education", "COURSE", 100);

  for (let i = 0; i < TREE.length; i++) {
    const level = await ensureNode(root.id, TREE[i].name, "LEVEL", i + 1);
    for (let j = 0; j < TREE[i].categories.length; j++) {
      await ensureNode(level.id, TREE[i].categories[j], "STAGE", j + 1);
    }
  }

  const total = await prisma.courseNode.count({
    where: { OR: [{ id: root.id }, { parentId: root.id }, { parent: { parentId: root.id } }] },
  });
  console.log(`\nDone. Higher Education tree now has ${total} nodes (expected 1 + 3 + 27 = 31).`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));