// Marks one "Latest updates" item as VERIFIED, so it shows on the site (while its deadline has not passed).
//
//   Dry run (default, reads only):
//     npx tsx scripts/verify-update.ts --db .env.neon-test <slug>
//   Write:
//     npx tsx scripts/verify-update.ts --db .env.neon-test <slug> --write
//   Options:
//     --main      required, with approval, to write to the live database (same host as .env)
//     --preview   test databases only: allow an item without a checked date, so a design preview can
//                 show it. Refused on the main database; the site then shows the source without a date.
//
// Before verifying, the item is checked again: title, organisation, one line, an https:// link that is
// allowed for its source type, a checked date (unless --preview), and a deadline that has not passed.

import { openDb } from "./lib/db-target";
import { linkProblems, SOURCE_TYPES } from "../lib/updates/rules";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const ALLOW_MAIN = args.includes("--main");
const PREVIEW = args.includes("--preview");
const dbIdx = args.indexOf("--db");
const dbFile = dbIdx >= 0 ? args[dbIdx + 1] : undefined;
const slug = args.find((a, i) => !a.startsWith("--") && i !== dbIdx + 1);
if (!dbFile || !slug) {
  console.error("Usage: npx tsx scripts/verify-update.ts --db <env file> <slug> [--preview] [--write [--main]]");
  process.exit(1);
}

// Same host test as scripts/lib/db-target.ts, to refuse --preview on the main database
function isMain(file: string) {
  const url = (f: string) => fs.readFileSync(f, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m)?.[1] ?? "";
  const host = (u: string) => (u ? new URL(u).hostname.replace("-pooler", "") : "");
  const main = path.join(process.cwd(), ".env");
  return fs.existsSync(main) && host(url(main)) === host(url(file));
}

async function main() {
  if (PREVIEW && isMain(dbFile!)) throw new Error("--preview is for test databases only, never the main database.");
  const prisma = openDb(dbFile!, { write: WRITE, allowMain: ALLOW_MAIN });
  try {
    const u = await prisma.latestUpdate.findUnique({ where: { slug: slug! } });
    if (!u) throw new Error(`No update "${slug}" in this database (import it first)`);

    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const problems = [
      ...(u.title ? [] : ["title is empty"]),
      ...(u.organisation ? [] : ["organisation is empty"]),
      ...(u.oneLine ? [] : ["one line is empty"]),
      ...((SOURCE_TYPES as readonly string[]).includes(u.sourceType) ? [] : [`source type "${u.sourceType}" is not allowed`]),
      ...linkProblems(u.linkUrl, u.sourceType, "link"),
      ...(u.checkedAt || PREVIEW ? [] : ["no checked date (check the link, then fill 'checked' in the sheet and re-import)"]),
      ...(u.deadline && u.deadline < todayUtc ? [`deadline ${u.deadline.toISOString().slice(0, 10)} has passed`] : []),
    ];

    console.log(`\n# Verify update ${u.slug}: ${WRITE ? "WRITE" : "DRY RUN"}${PREVIEW ? " (preview: checked date not required)" : ""}\n`);
    console.log(`- ${u.title} (${u.organisation}) — now ${u.status} → VERIFIED`);
    console.log(`- Link: ${u.linkUrl} (${u.sourceType})`);
    console.log(`- Deadline: ${u.deadline ? u.deadline.toISOString().slice(0, 10) : "none given"} | Checked: ${u.checkedAt ? u.checkedAt.toISOString().slice(0, 10) : "none"}`);
    console.log(`\nProblems: ${problems.length ? "\n- " + problems.join("\n- ") : "none"}`);

    if (!WRITE) return console.log("\nDRY RUN: nothing was written. Re-run with --write to verify.");
    if (problems.length) {
      process.exitCode = 1;
      return console.error("\nNot written: fix the problems above first.");
    }
    await prisma.latestUpdate.update({ where: { id: u.id }, data: { status: "VERIFIED", verifiedAt: new Date() } });
    console.log(`\nWritten: ${u.slug} is VERIFIED.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e).replace(/postgres(ql)?:\/\/\S+/g, "<url hidden>"));
  process.exit(1);
});
