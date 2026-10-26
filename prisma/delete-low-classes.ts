import "dotenv/config";
import { prisma } from "../lib/prisma";

const DO_DELETE = process.argv.includes("--delete");
const FORCE = process.argv.includes("--force");

// All ids in a branch of the tree: the node itself and everything below it
async function branchIds(rootId: string) {
  const ids = [rootId];
  let frontier = [rootId];
  while (frontier.length > 0) {
    const kids = await prisma.courseNode.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    frontier = kids.map((k) => k.id);
    ids.push(...frontier);
  }
  return ids;
}

async function main() {
  const boards = await prisma.courseNode.findMany({
    where: { kind: "COURSE", slug: { in: ["cbse", "icse"] } },
    include: { children: { orderBy: { position: "asc" } } },
  });

  const toDelete: { id: string; label: string; nodes: number; posts: number }[] = [];

  for (const board of boards) {
    for (const level of board.children) {
      const match = level.name.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : NaN;
      if (isNaN(num)) {
        console.log(`  skipped (no class number): ${board.name} / ${level.name}`);
        continue;
      }
      const keep = num >= 9;
      const ids = await branchIds(level.id);
      const posts = await prisma.opportunity.count({ where: { courseNodeId: { in: ids } } });
      console.log(
        `${keep ? "KEEP  " : "DELETE"} ${board.name} / ${level.name}  (${ids.length} nodes, ${posts} linked posts)`
      );
      if (!keep) toDelete.push({ id: level.id, label: `${board.name} / ${level.name}`, nodes: ids.length, posts });
    }
  }

  const totalPosts = toDelete.reduce((a, b) => a + b.posts, 0);
  const totalNodes = toDelete.reduce((a, b) => a + b.nodes, 0);
  console.log(`\nWould delete ${toDelete.length} classes, ${totalNodes} nodes. Posts linked to them: ${totalPosts}`);

  if (!DO_DELETE) {
    console.log("\nDRY RUN: nothing was deleted. To delete, run again with --delete");
    return;
  }

  if (totalPosts > 0 && !FORCE) {
    console.log("\nSTOPPED: some posts are linked to these classes. Deleting would unlink them. Add --force to continue.");
    return;
  }

  for (const d of toDelete) {
    await prisma.courseNode.delete({ where: { id: d.id } });
    console.log(`deleted: ${d.label}`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));