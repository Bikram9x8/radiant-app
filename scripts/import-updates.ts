// Imports "Latest updates" items from Radiant-Latest-Updates.xlsx (sheet "Updates").
//
//   Dry run (default, reads the database only, writes nothing):
//     npx tsx scripts/import-updates.ts --db .env.neon-test "C:\radiant edu\data\Radiant-Latest-Updates.xlsx"
//   Write (only after the dry-run report has been reviewed):
//     npx tsx scripts/import-updates.ts --db <env file> <xlsx> --write
//
// --db is required (the database is always chosen on purpose); --write to the main database is refused
// unless --main is also passed (scripts/lib/db-target.ts). Same pattern as import-colleges.
//
// Rules:
// - Columns are read by header name (row 1). Each item is upserted by its slug (title + organisation).
// - The link is official_url when filled, otherwise supervisor_post_url. Every link must be https://.
//   LinkedIn / lnkd.in links only when source_type is "Supervisor post" or "Organisation post".
//   WhatsApp forwards and aggregator sites are errors (lib/updates/rules.ts).
// - deadline and checked must be real dates (dd-mm-yyyy or an Excel date) when filled.
// - status "To check" and "Ready" are imported as DRAFT (verifying is a separate step:
//   scripts/verify-update.ts). "Closed" rows are skipped. A changed VERIFIED item goes back to DRAFT.
// - Nothing is ever deleted. Any error blocks --write.

import path from "node:path";
import ExcelJS from "exceljs";
import { openDb } from "./lib/db-target";
import { linkProblems, POST_SOURCES, SOURCE_TYPES, UPDATE_TYPES, updateSlug } from "../lib/updates/rules";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const ALLOW_MAIN = args.includes("--main");
const dbIdx = args.indexOf("--db");
const dbFile = dbIdx >= 0 ? args[dbIdx + 1] : undefined;
const xlsxPath = args.find((a, i) => !a.startsWith("--") && i !== dbIdx + 1);
if (!dbFile || !xlsxPath) {
  console.error("Usage: npx tsx scripts/import-updates.ts --db <env file> <xlsx> [--write [--main]]");
  process.exit(1);
}

type Issue = { level: "error" | "warning"; where: string; msg: string };
const issues: Issue[] = [];
const err = (where: string, msg: string) => issues.push({ level: "error", where, msg });
const warn = (where: string, msg: string) => issues.push({ level: "warning", where, msg });

const COLS = ["id", "title", "organisation", "type", "for_who", "location", "mode", "dates", "deadline", "one_line",
  "official_url", "source_type", "supervisor_post_url", "checked", "status", "notes"];

function text(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((r) => r.text).join("").trim();
    if ("hyperlink" in v) return String((v as { hyperlink: string }).hyperlink).trim();
    if ("result" in v) return text(v.result as ExcelJS.CellValue);
    if ("error" in v) return "";
  }
  return String(v).trim();
}

const TODAY = (() => {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
})();
const iso = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

function dateCell(v: ExcelJS.CellValue, col: string, where: string): Date | null {
  if (v === null || v === undefined || text(v) === "") return null;
  if (v instanceof Date) return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
  if (typeof v === "number") return new Date(Math.round((v - 25569) * 86400000));
  const m = text(v).match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) {
    const [dd, mm, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (d.getUTCDate() === dd && d.getUTCMonth() === mm - 1) return d;
  }
  err(where, `${col} is not a real date (type like 18-12-2026; got "${text(v)}")`);
  return null;
}

type Item = {
  slug: string;
  title: string;
  organisation: string;
  type: string;
  forWho: string | null;
  location: string | null;
  mode: string | null;
  dates: string | null;
  deadline: Date | null;
  oneLine: string;
  linkUrl: string;
  sourceType: string;
  checkedAt: Date | null;
  internalNotes: string | null;
};

async function readItems(): Promise<{ items: (Item & { row: number })[]; skipped: string[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(xlsxPath!);
  const ws = wb.getWorksheet("Updates");
  if (!ws) {
    err("Workbook", 'sheet "Updates" not found');
    return { items: [], skipped: [] };
  }
  const head = new Map<string, number>();
  (ws.getRow(1).values as ExcelJS.CellValue[]).forEach((v, i) => text(v) && head.set(text(v), i));
  for (const c of COLS) if (!head.has(c)) err("Updates", `missing column "${c}" (do not rename headers)`);
  for (const h of head.keys()) if (!COLS.includes(h)) warn("Updates", `unknown column "${h}" is ignored`);

  const items: (Item & { row: number })[] = [];
  const skipped: string[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const get = (c: string) => (head.has(c) ? row.getCell(head.get(c)!).value : null);
    const t = (c: string) => text(get(c));
    if (COLS.every((c) => !t(c))) continue; // empty row
    const where = `Updates row ${r} (id ${t("id") || "-"})`;

    const status = t("status");
    if (status === "Closed") {
      skipped.push(`${where}: skipped: status Closed`);
      continue;
    }
    if (status !== "To check" && status !== "Ready") err(where, `status "${status}" must be To check, Ready or Closed`);

    const title = t("title"), organisation = t("organisation"), oneLine = t("one_line");
    if (!title) err(where, "title is empty");
    if (!organisation) err(where, "organisation is empty");
    if (!oneLine) err(where, "one_line is empty");
    if (oneLine.length > 200) warn(where, `one_line is ${oneLine.length} characters (keep it to one short line)`);

    const type = t("type");
    if (!(UPDATE_TYPES as readonly string[]).includes(type)) err(where, `type "${type}" must be one of: ${UPDATE_TYPES.join(", ")}`);
    const sourceType = t("source_type");
    if (!(SOURCE_TYPES as readonly string[]).includes(sourceType))
      err(where, `source_type "${sourceType}" must be one of: ${SOURCE_TYPES.join(", ")}`);

    const official = t("official_url"), post = t("supervisor_post_url");
    for (const [col, url] of [["official_url", official], ["supervisor_post_url", post]] as const) {
      if (!url) continue;
      // The post link is checked as a post even when the item itself has an official page
      for (const p of linkProblems(url, col === "supervisor_post_url" ? "Supervisor post" : sourceType, col)) err(where, p);
    }
    if (!POST_SOURCES.includes(sourceType) && !official) err(where, `source_type "${sourceType}" needs an official_url`);
    if (!official && !post) err(where, "no link: fill official_url (or supervisor_post_url for a post)");
    if (POST_SOURCES.includes(sourceType) && !official) warn(where, `no official page yet: the site will link to the ${sourceType.toLowerCase()}`);

    const deadline = dateCell(get("deadline"), "deadline", where);
    if (deadline && deadline < TODAY) warn(where, `deadline ${iso(deadline)} has passed: it will never show`);
    const checkedAt = dateCell(get("checked"), "checked", where);
    if (checkedAt && checkedAt > TODAY) err(where, `checked ${iso(checkedAt)} is in the future`);
    if (!checkedAt) warn(where, "checked is empty: needed before this item can be verified");

    items.push({
      row: r,
      slug: updateSlug(title, organisation),
      title,
      organisation,
      type,
      forWho: t("for_who") || null,
      location: t("location") || null,
      mode: t("mode") || null,
      dates: t("dates") || null,
      deadline,
      oneLine,
      linkUrl: official || post,
      sourceType,
      checkedAt,
      internalNotes: t("notes") || null,
    });
  }
  const seen = new Set<string>();
  for (const i of items) {
    if (seen.has(i.slug)) err(`Updates row ${i.row}`, `same title + organisation as another row (slug "${i.slug}")`);
    seen.add(i.slug);
  }
  return { items, skipped };
}

const norm = (v: unknown) => (v instanceof Date ? iso(v) : (v ?? null));

async function main() {
  const { items, skipped } = await readItems();
  const prisma = openDb(dbFile!, { write: WRITE, allowMain: ALLOW_MAIN });
  try {
    const existing = await prisma.latestUpdate.findMany({ where: { slug: { in: items.map((i) => i.slug) } } });
    const bySlug = new Map(existing.map((e) => [e.slug, e]));
    const plan = items.map((i) => {
      const prev = bySlug.get(i.slug);
      const { row: _row, ...data } = i;
      void _row;
      if (!prev) return { i, data, action: "insert" as const, fields: [] as string[], backToDraft: false };
      const fields = Object.keys(data).filter((k) => norm(data[k as keyof typeof data]) !== norm(prev[k as keyof typeof prev]));
      return { i, data, action: fields.length ? ("update" as const) : ("unchanged" as const), fields, backToDraft: !!fields.length && prev.status === "VERIFIED" };
    });

    const errors = issues.filter((x) => x.level === "error");
    const warnings = issues.filter((x) => x.level === "warning");
    const lines = [
      `# Latest updates import: ${WRITE ? "WRITE" : "DRY RUN"}`,
      "",
      `- File: ${path.basename(xlsxPath!)}`,
      `- Database: from ${path.basename(dbFile!)}`,
      `- Rows read: ${items.length} item(s)${skipped.length ? `, ${skipped.length} skipped` : ""}`,
      `- Errors: ${errors.length} | Warnings: ${warnings.length}`,
      "",
      "## Plan (new items as DRAFT)",
      "",
      "| Row | Slug | Type | Deadline | Link from | Action |",
      "|---|---|---|---|---|---|",
      ...plan.map(
        (p) =>
          `| ${p.i.row} | ${p.i.slug} | ${p.i.type} | ${iso(p.i.deadline) ?? "-"} | ${p.i.linkUrl === "" ? "-" : new URL(p.i.linkUrl).hostname} (${p.i.sourceType}) | ${p.action}${p.backToDraft ? " → back to DRAFT" : ""}${p.fields.length ? `: ${p.fields.join(", ")}` : ""} |`,
      ),
      ...(skipped.length ? ["", "## Skipped", "", ...skipped.map((x) => `- ${x}`)] : []),
      "",
      "## Errors (block --write)",
      "",
      ...(errors.length ? errors.map((e) => `- **${e.where}**: ${e.msg}`) : ["- None"]),
      "",
      "## Warnings",
      "",
      ...(warnings.length ? warnings.map((e) => `- **${e.where}**: ${e.msg}`) : ["- None"]),
    ];
    console.log(lines.join("\n"));

    if (!WRITE) return console.log("\nDRY RUN: nothing was written. Re-run with --write after the report is approved.");
    if (errors.length) {
      process.exitCode = 1;
      return console.error("\nNot written: fix the errors above first.");
    }
    await prisma.$transaction(
      plan
        .filter((p) => p.action !== "unchanged")
        .map((p) =>
          prisma.latestUpdate.upsert({
            where: { slug: p.i.slug },
            create: { ...p.data, status: "DRAFT" },
            update: { ...p.data, ...(p.backToDraft ? { status: "DRAFT" as const, verifiedAt: null } : {}) },
          }),
        ),
    );
    console.log("\nWritten.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e).replace(/postgres(ql)?:\/\/\S+/g, "<url hidden>"));
  process.exit(1);
});
