// Imports colleges and courses from the Radiant College & Course xlsx template.
//
//   Dry run (default, reads the database only, writes nothing):
//     npx tsx scripts/import-colleges.ts --db .env.neon-test "C:\radiant edu\data\Radiant-College-Course-Template-v3.xlsx"
//   Write (only after the dry-run report has been reviewed and approved):
//     npx tsx scripts/import-colleges.ts --db <env file> <xlsx> --write
//
// --db is required: the script reads DATABASE_URL from that file only (never from the shell or .env
// by accident), so the target database is always chosen on purpose. --write to the main database
// (same host as .env) is refused unless --main is also passed (scripts/lib/db-target.ts).
//
// Rules (from the template's "How to fill" sheet):
// - Columns are read by header name; row 1 = headers, row 2 = example (skipped), data from row 3.
// - Every fact group with a value needs its official https:// source URL and checked date.
// - Empty cells stay empty ("Not available yet" on the site). Nothing is guessed or calculated:
//   the importer never works out a yearly or total fee.
// - Dropdown values must match the Lists sheet. Entrance exams must match the Lists "Exams" column.
// - New rows are imported as DRAFT. If a re-import changes a VERIFIED row, it goes back to DRAFT and
//   is listed in the report. Nothing is ever deleted: rows missing from the sheet are only reported.
// - Any error blocks --write entirely.

import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { Prisma } from "@prisma/client";
import { openDb } from "./lib/db-target";

// ---------- Arguments ----------
const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const ALLOW_MAIN = args.includes("--main"); // required (with approval) to write to the live database
const dbIdx = args.indexOf("--db");
const dbFile = dbIdx >= 0 ? args[dbIdx + 1] : undefined;
const xlsxPath = args.find((a, i) => !a.startsWith("--") && i !== dbIdx + 1);
if (!dbFile || !xlsxPath) {
  console.error('Usage: npx tsx scripts/import-colleges.ts --db <env file> <xlsx> [--write [--main]]');
  process.exit(1);
}

// ---------- Report ----------
type Issue = { level: "error" | "warning"; where: string; msg: string };
const issues: Issue[] = [];
const err = (where: string, msg: string) => issues.push({ level: "error", where, msg });
const warn = (where: string, msg: string) => issues.push({ level: "warning", where, msg });

// ---------- Cell reading ----------
type Cell = ExcelJS.CellValue;

function cellText(v: Cell): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((r) => r.text).join("").trim();
    if ("hyperlink" in v) return String((v as { text?: unknown }).text ?? v.hyperlink).trim();
    if ("result" in v) return cellText(v.result as Cell);
    if ("error" in v) return "";
  }
  return String(v).trim();
}

type Row = { rowNo: number; get: (h: string) => Cell; text: (h: string) => string };

// The whole workbook, sheet by sheet: rows[rowNumber][columnNumber] (both 1-based).
// ExcelJS's streaming reader is used because the normal reader fails on the template's header notes
// (hover comments). The streaming reader does not give sheet names, so each sheet is found by its
// header row instead (see findSheet), which matches the "columns are read by header name" rule.
type Sheet = { rows: Cell[][] };

async function loadSheets(file: string): Promise<Sheet[]> {
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(file, {
    sharedStrings: "cache",
    styles: "cache",
    hyperlinks: "ignore",
    worksheets: "emit",
    entries: "emit",
  });
  const sheets: Sheet[] = [];
  for await (const ws of reader) {
    const rows: Cell[][] = [];
    for await (const row of ws as AsyncIterable<ExcelJS.Row>) rows[row.number] = row.values as Cell[];
    sheets.push({ rows });
  }
  return sheets;
}

const headerRow = (s: Sheet) => (s.rows[1] ?? []).map((v) => cellText(v));

function findSheet(sheets: Sheet[], name: string, marker: string): Sheet | null {
  const found = sheets.filter((s) => headerRow(s).includes(marker));
  if (found.length !== 1) {
    err(name, found.length ? `more than one sheet looks like "${name}"` : `sheet "${name}" not found (no "${marker}" header)`);
    return null;
  }
  return found[0];
}

function readSheet(ws: Sheet | null, name: string, required: string[]): Row[] {
  if (!ws) return [];
  const headers = new Map<string, number>();
  headerRow(ws).forEach((h, col) => {
    if (h) headers.set(h, col);
  });
  for (const h of required) if (!headers.has(h)) err(name, `missing column "${h}" (do not rename headers)`);
  for (const h of headers.keys()) if (!required.includes(h)) warn(name, `unknown column "${h}" is ignored`);

  const rows: Row[] = [];
  for (let r = 3; r < ws.rows.length; r++) {
    const values = ws.rows[r] ?? [];
    const get = (h: string) => (headers.has(h) ? (values[headers.get(h)!] ?? null) : null);
    const text = (h: string) => cellText(get(h));
    if (required.every((h) => !text(h))) continue; // empty row
    if (/^example/i.test(text(required[0]))) continue; // example row copied lower down
    rows.push({ rowNo: r, get, text });
  }
  return rows;
}

function readLists(ws: Sheet | null) {
  const lists: Record<string, string[]> = {};
  if (!ws) return lists;
  headerRow(ws).forEach((name, col) => {
    if (!name) return;
    const vals: string[] = [];
    for (let r = 2; r < ws.rows.length; r++) {
      const v = cellText(ws.rows[r]?.[col] ?? null);
      if (v) vals.push(v);
    }
    lists[name] = vals;
  });
  for (const k of ["Type", "State", "YesNo", "NAAC", "Level", "Mode", "Stream", "Exams"]) {
    if (!lists[k]?.length) err("Lists", `list "${k}" is missing or empty`);
  }
  return lists;
}

// ---------- Field parsers (each reports its own problems and returns null when empty or invalid) ----------
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BLOCKED_HOSTS = ["shiksha.com", "collegedunia.com", "careers360.com", "youtube.com", "youtu.be", "getmyuni.com",
  "collegedekho.com", "indiatoday.in", "jagranjosh.com", "wikipedia.org", "blogspot.com", "medium.com", "quora.com"];
const TODAY = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
const MIN_CHECKED = new Date("2024-01-01T00:00:00Z");

function pUrl(row: Row, h: string, where: string): string | null {
  const s = row.text(h);
  if (!s) return null;
  if (!s.startsWith("https://")) return err(where, `${h} must start with https:// ("${s}")`), null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return err(where, `${h} is not a valid link ("${s}")`), null;
  }
  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.some((b) => host === b || host.endsWith("." + b)))
    return err(where, `${h} is not an official source (${host})`), null;
  return s;
}

function excelSerialToDate(n: number) {
  // Excel serial day 25569 = 1970-01-01
  return new Date(Math.round((n - 25569) * 86400000));
}

function pDate(row: Row, h: string, where: string, opts: { checked: boolean }): Date | null {
  const v = row.get(h);
  const s = cellText(v);
  if (!s) return null;
  let d: Date | null = null;
  if (v instanceof Date) d = new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
  else if (typeof v === "number") d = excelSerialToDate(v);
  else {
    const m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (m) {
      const [dd, mm, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const t = new Date(Date.UTC(yyyy, mm - 1, dd));
      if (t.getUTCDate() === dd && t.getUTCMonth() === mm - 1) d = t;
    }
  }
  if (!d || isNaN(d.getTime())) return err(where, `${h} is not a date (type like 22-11-2026; got "${s}")`), null;
  if (opts.checked) {
    if (d < MIN_CHECKED) return err(where, `${h} ${iso(d)} is before 01-01-2024`), null;
    if (d > TODAY) return err(where, `${h} ${iso(d)} is in the future`), null;
  } else if (d.getUTCFullYear() < 2000 || d.getUTCFullYear() > 2100) {
    return err(where, `${h} ${iso(d)} looks wrong`), null;
  }
  return d;
}

function pNumber(row: Row, h: string, where: string, o: { int?: boolean; min?: number; max?: number } = {}): number | null {
  const v = row.get(h);
  const s = cellText(v);
  if (!s) return null;
  if (typeof v !== "number" && !/^\d+(\.\d+)?$/.test(s))
    return err(where, `${h} must be a plain number, no ₹ sign, commas or text ("${s}")`), null;
  const n = typeof v === "number" ? v : Number(s);
  if (o.int && !Number.isInteger(n)) return err(where, `${h} must be a whole number ("${s}")`), null;
  if (o.min !== undefined && n < o.min) return err(where, `${h} ${n} is below ${o.min}`), null;
  if (o.max !== undefined && n > o.max) return err(where, `${h} ${n} is above ${o.max}`), null;
  return n;
}

function pList(row: Row, h: string, where: string, allowed: string[] | undefined): string | null {
  const s = row.text(h);
  if (!s) return null;
  if (allowed && !allowed.includes(s)) return err(where, `${h} "${s}" is not in the Lists sheet`), null;
  return s;
}

function pText(row: Row, h: string): string | null {
  return row.text(h) || null;
}

const iso = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

/** A fact group: if any value is filled, its source URL and checked date are required */
function group(where: string, label: string, values: unknown[], src: string | null, srcCol: string, date: Date | null, dateCol: string, rawDate: string) {
  const hasValue = values.some((v) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0));
  if (hasValue) {
    if (!src) err(where, `${label}: filled in but ${srcCol} is empty`);
    if (!date && !rawDate) err(where, `${label}: filled in but ${dateCol} is empty`);
  } else if (src || rawDate) {
    warn(where, `${label}: ${srcCol}/${dateCol} filled in but no value`);
  }
}

// ---------- Parse ----------
const COLLEGE_COLS = ["college_id", "college_name", "short_name", "type", "established_year", "city", "district", "state",
  "pincode", "full_address", "official_website", "basic_info_source_url", "basic_info_checked", "approved_by",
  "approval_source_url", "approval_checked", "naac_grade", "naac_valid_until", "naac_source_url", "naac_checked",
  "nirf_rank", "nirf_category", "nirf_year", "nirf_source_url", "nirf_checked", "hostel", "campus_area_acres",
  "facilities_source_url", "facilities_checked", "admission_phone", "admission_email", "contact_source_url",
  "contact_checked", "image_permission", "logo_permission", "notes"];

const COURSE_COLS = ["college_id", "course_id", "course_name", "level", "stream", "specialization", "duration_years", "mode",
  "seats", "course_source_url", "fee_per_year_inr", "fee_per_semester_inr", "total_fee_inr", "fee_year", "fee_source_url",
  "fee_checked", "eligibility", "eligibility_source_url", "entrance_exams", "exam_source_url", "course_checked", "notes"];

const APPROVAL_BODIES = ["UGC", "AICTE", "NCTE", "BCI", "PCI", "INC", "NMC", "DCI", "COA", "ICAR", "AIU", "NCAHP", "CCIM", "CCH", "RCI", "DEB", "MCI"];

type CollegeData = Omit<Prisma.CollegeUncheckedCreateInput, "id" | "status" | "verifiedAt" | "createdAt" | "updatedAt">;
type CourseData = Omit<Prisma.CourseUncheckedCreateInput, "id" | "collegeId" | "status" | "verifiedAt" | "createdAt" | "updatedAt"> & { collegeSlug: string };

function parseCollege(row: Row, L: Record<string, string[]>): CollegeData | null {
  const slug = row.text("college_id");
  const where = `Colleges row ${row.rowNo} (${slug || "no id"})`;
  if (!slug) return err(where, "college_id is empty"), null;
  if (!SLUG.test(slug)) err(where, `college_id "${slug}" must be small letters, numbers and dashes`);
  const name = pText(row, "college_name");
  if (!name) err(where, "college_name is empty");

  const d = (h: string) => pDate(row, h, where, { checked: true });
  const thisYear = TODAY.getUTCFullYear();

  const c: CollegeData = {
    slug,
    name: name ?? "",
    shortName: pText(row, "short_name"),
    type: pList(row, "type", where, L.Type),
    establishedYear: pNumber(row, "established_year", where, { int: true, min: 1800, max: thisYear }),
    city: pText(row, "city"),
    district: pText(row, "district"),
    state: pList(row, "state", where, L.State),
    pincode: null,
    fullAddress: pText(row, "full_address"),
    officialWebsite: pUrl(row, "official_website", where),
    basicInfoSourceUrl: pUrl(row, "basic_info_source_url", where),
    basicInfoCheckedAt: d("basic_info_checked"),
    approvedBy: [],
    approvalSourceUrl: pUrl(row, "approval_source_url", where),
    approvalCheckedAt: d("approval_checked"),
    naacGrade: pList(row, "naac_grade", where, L.NAAC),
    naacValidUntil: pDate(row, "naac_valid_until", where, { checked: false }),
    naacSourceUrl: pUrl(row, "naac_source_url", where),
    naacCheckedAt: d("naac_checked"),
    nirfRank: pText(row, "nirf_rank"),
    nirfCategory: pText(row, "nirf_category"),
    nirfYear: pNumber(row, "nirf_year", where, { int: true, min: 2016, max: thisYear }),
    nirfSourceUrl: pUrl(row, "nirf_source_url", where),
    nirfCheckedAt: d("nirf_checked"),
    hostel: pList(row, "hostel", where, L.YesNo),
    campusAreaAcres: pNumber(row, "campus_area_acres", where, { min: 0.01, max: 100000 }),
    facilitiesSourceUrl: pUrl(row, "facilities_source_url", where),
    facilitiesCheckedAt: d("facilities_checked"),
    admissionPhone: pText(row, "admission_phone"),
    admissionEmail: pText(row, "admission_email"),
    contactSourceUrl: pUrl(row, "contact_source_url", where),
    contactCheckedAt: d("contact_checked"),
    imagePermission: pList(row, "image_permission", where, L.YesNo),
    logoPermission: pList(row, "logo_permission", where, L.YesNo),
    internalNotes: pText(row, "notes"),
  };

  const pin = row.text("pincode");
  if (pin) {
    if (/^\d{6}$/.test(pin)) c.pincode = pin;
    else err(where, `pincode "${pin}" must be 6 digits`);
  }

  const approved = row.text("approved_by");
  if (approved) {
    const bodies = approved.split(",").map((s) => s.trim()).filter(Boolean);
    for (const b of bodies) if (!APPROVAL_BODIES.includes(b)) warn(where, `approved_by "${b}" is not a known body name (check spelling)`);
    c.approvedBy = bodies;
  }
  if (c.admissionEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.admissionEmail)) err(where, `admission_email "${c.admissionEmail}" is not an email`);
  if (c.admissionPhone && !/^[+\d][\d\s-]{6,}$/.test(c.admissionPhone)) warn(where, `admission_phone "${c.admissionPhone}" looks unusual`);
  if (c.hostel === "Not sure") warn(where, 'hostel "Not sure" will show as "Not available yet"');

  const raw = (h: string) => row.text(h);
  group(where, "Basic info", [c.shortName, c.type, c.establishedYear, c.city, c.district, c.state, c.pincode, c.fullAddress, c.officialWebsite],
    c.basicInfoSourceUrl ?? null, "basic_info_source_url", (c.basicInfoCheckedAt as Date) ?? null, "basic_info_checked", raw("basic_info_checked"));
  group(where, "Approval", [c.approvedBy], c.approvalSourceUrl ?? null, "approval_source_url", (c.approvalCheckedAt as Date) ?? null, "approval_checked", raw("approval_checked"));
  group(where, "NAAC", [c.naacGrade, c.naacValidUntil], c.naacSourceUrl ?? null, "naac_source_url", (c.naacCheckedAt as Date) ?? null, "naac_checked", raw("naac_checked"));
  group(where, "NIRF", [c.nirfRank, c.nirfCategory, c.nirfYear], c.nirfSourceUrl ?? null, "nirf_source_url", (c.nirfCheckedAt as Date) ?? null, "nirf_checked", raw("nirf_checked"));
  group(where, "Facilities", [c.hostel, c.campusAreaAcres], c.facilitiesSourceUrl ?? null, "facilities_source_url", (c.facilitiesCheckedAt as Date) ?? null, "facilities_checked", raw("facilities_checked"));
  group(where, "Contact", [c.admissionPhone, c.admissionEmail], c.contactSourceUrl ?? null, "contact_source_url", (c.contactCheckedAt as Date) ?? null, "contact_checked", raw("contact_checked"));
  if (c.nirfRank && !c.nirfYear) err(where, "nirf_rank is filled in but nirf_year is empty");
  return c;
}

function parseCourse(row: Row, L: Record<string, string[]>): CourseData | null {
  const collegeSlug = row.text("college_id");
  const courseId = row.text("course_id");
  const where = `Courses row ${row.rowNo} (${collegeSlug || "no college"} / ${courseId || "no course_id"})`;
  if (!collegeSlug) return err(where, "college_id is empty"), null;
  if (!courseId) return err(where, "course_id is empty"), null;
  if (!SLUG.test(courseId)) err(where, `course_id "${courseId}" must be small letters, numbers and dashes`);
  const name = pText(row, "course_name");
  if (!name) err(where, "course_name is empty");

  const checked = pDate(row, "course_checked", where, { checked: true });
  const c: CourseData = {
    collegeSlug,
    courseId,
    name: name ?? "",
    level: pList(row, "level", where, L.Level),
    stream: pList(row, "stream", where, L.Stream),
    specialization: pText(row, "specialization"),
    durationYears: pNumber(row, "duration_years", where, { min: 0.5, max: 7 }),
    mode: pList(row, "mode", where, L.Mode),
    seats: pNumber(row, "seats", where, { int: true, min: 1, max: 100000 }),
    courseSourceUrl: pUrl(row, "course_source_url", where),
    courseCheckedAt: checked,
    feePerYearInr: pNumber(row, "fee_per_year_inr", where, { int: true, min: 1, max: 100000000 }),
    feePerSemesterInr: pNumber(row, "fee_per_semester_inr", where, { int: true, min: 1, max: 100000000 }),
    totalFeeInr: pNumber(row, "total_fee_inr", where, { int: true, min: 1, max: 1000000000 }),
    feeYear: pText(row, "fee_year"),
    feeSourceUrl: pUrl(row, "fee_source_url", where),
    feeCheckedAt: pDate(row, "fee_checked", where, { checked: true }),
    eligibility: pText(row, "eligibility"),
    eligibilitySourceUrl: pUrl(row, "eligibility_source_url", where),
    entranceExams: [],
    examSourceUrl: pUrl(row, "exam_source_url", where),
    internalNotes: pText(row, "notes"),
  };

  const dur = c.durationYears as number | null;
  if (dur !== null && dur !== undefined && !Number.isInteger(dur * 2)) err(where, `duration_years ${dur} must be in half years (e.g. 3 or 3.5)`);

  const exams = row.text("entrance_exams");
  if (exams) {
    const list = exams.split(",").map((s) => s.trim()).filter(Boolean);
    for (const e of list) if (!L.Exams?.includes(e)) err(where, `entrance exam "${e}" is not in the Lists "Exams" column`);
    if (list.includes("None") && list.length > 1) err(where, 'entrance_exams: "None" cannot be combined with other exams');
    c.entranceExams = list;
  }

  // Fees: never calculated by us. Flag figures that look worked out from each other.
  const y = c.feePerYearInr as number | null, s = c.feePerSemesterInr as number | null, t = c.totalFeeInr as number | null;
  if (y && s && y === 2 * s) warn(where, `fee_per_year_inr (${y}) is exactly 2 × fee_per_semester_inr: make sure the official page states the yearly fee itself`);
  if (t && dur && ((y && t === y * dur) || (s && t === s * 2 * dur)))
    warn(where, `total_fee_inr (${t}) equals the yearly/semester fee × duration: make sure the official page states the total itself`);
  if ((y || s || t) && !c.feeYear) err(where, "a fee is filled in but fee_year is empty (e.g. 2026-27)");
  if (c.feeYear && !/^\d{4}-\d{2}$/.test(c.feeYear as string)) err(where, `fee_year "${c.feeYear}" must look like 2026-27`);

  const raw = row.text("course_checked");
  group(where, "Course details", [c.level, c.stream, c.specialization, c.durationYears, c.mode, c.seats],
    c.courseSourceUrl ?? null, "course_source_url", checked, "course_checked", raw);
  group(where, "Fees", [c.feePerYearInr, c.feePerSemesterInr, c.totalFeeInr], c.feeSourceUrl ?? null, "fee_source_url",
    (c.feeCheckedAt as Date) ?? null, "fee_checked", row.text("fee_checked"));
  group(where, "Eligibility", [c.eligibility], c.eligibilitySourceUrl ?? null, "eligibility_source_url", checked, "course_checked", raw);
  group(where, "Entrance exams", [c.entranceExams], c.examSourceUrl ?? null, "exam_source_url", checked, "course_checked", raw);
  return c;
}

// ---------- Compare with the database ----------
function norm(v: unknown): unknown {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return iso(v);
  if (v instanceof Prisma.Decimal) return Number(v.toString());
  if (Array.isArray(v)) return v.join(", ");
  return v;
}

function changedFields(next: Record<string, unknown>, prev: Record<string, unknown>, skip: string[]) {
  return Object.keys(next).filter((k) => !skip.includes(k) && norm(next[k]) !== norm(prev[k]));
}

// ---------- Main ----------
async function main() {
  const sheets = await loadSheets(xlsxPath!);
  const L = readLists(findSheet(sheets, "Lists", "Exams"));
  const colleges = readSheet(findSheet(sheets, "Colleges", "college_name"), "Colleges", COLLEGE_COLS)
    .map((r) => parseCollege(r, L))
    .filter((c): c is CollegeData => !!c);
  const courses = readSheet(findSheet(sheets, "Courses", "course_id"), "Courses", COURSE_COLS)
    .map((r) => parseCourse(r, L))
    .filter((c): c is CourseData => !!c);

  // Duplicates and links between sheets
  const seenC = new Set<string>();
  for (const c of colleges) {
    if (seenC.has(c.slug)) err(`Colleges (${c.slug})`, "college_id appears more than once");
    seenC.add(c.slug);
  }
  const seenK = new Set<string>();
  for (const c of courses) {
    const key = `${c.collegeSlug}/${c.courseId}`;
    if (seenK.has(key)) err(`Courses (${key})`, "college_id + course_id appears more than once");
    seenK.add(key);
  }

  const prisma = openDb(dbFile!, { write: WRITE, allowMain: ALLOW_MAIN });
  try {
    const slugs = [...new Set([...colleges.map((c) => c.slug), ...courses.map((c) => c.collegeSlug)])];
    const existing = await prisma.college.findMany({ where: { slug: { in: slugs } }, include: { courses: true } });
    const bySlug = new Map(existing.map((c) => [c.slug, c]));

    for (const c of courses) {
      if (!seenC.has(c.collegeSlug) && !bySlug.has(c.collegeSlug))
        err(`Courses (${c.collegeSlug}/${c.courseId})`, `college_id "${c.collegeSlug}" is not on the Colleges sheet or in the database`);
    }

    type Plan = { kind: "college" | "course"; key: string; action: "insert" | "update" | "unchanged"; backToDraft: boolean; fields: string[] };
    const plan: Plan[] = [];
    for (const c of colleges) {
      const prev = bySlug.get(c.slug);
      if (!prev) plan.push({ kind: "college", key: c.slug, action: "insert", backToDraft: false, fields: [] });
      else {
        const f = changedFields(c, prev, ["slug"]);
        plan.push({ kind: "college", key: c.slug, action: f.length ? "update" : "unchanged", backToDraft: !!f.length && prev.status === "VERIFIED", fields: f });
      }
    }
    for (const c of courses) {
      const prev = bySlug.get(c.collegeSlug)?.courses.find((x) => x.courseId === c.courseId);
      const key = `${c.collegeSlug}/${c.courseId}`;
      if (!prev) plan.push({ kind: "course", key, action: "insert", backToDraft: false, fields: [] });
      else {
        const f = changedFields(c, prev, ["collegeSlug", "courseId"]);
        plan.push({ kind: "course", key, action: f.length ? "update" : "unchanged", backToDraft: !!f.length && prev.status === "VERIFIED", fields: f });
      }
    }
    const notInSheet = [
      ...existing.flatMap((col) => col.courses.filter((x) => !seenK.has(`${col.slug}/${x.courseId}`)).map((x) => `${col.slug}/${x.courseId}`)),
    ];

    // ----- Report -----
    const errors = issues.filter((i) => i.level === "error");
    const warnings = issues.filter((i) => i.level === "warning");
    const lines: string[] = [];
    lines.push(`# College & Course import: ${WRITE ? "WRITE" : "DRY RUN"}`, "");
    lines.push(`- File: ${path.basename(xlsxPath!)}`);
    lines.push(`- Database: from ${path.basename(dbFile!)}`);
    lines.push(`- Run: ${new Date().toISOString()}`);
    lines.push(`- Rows read: ${colleges.length} college(s), ${courses.length} course(s) (example row skipped)`);
    lines.push(`- Errors: ${errors.length} | Warnings: ${warnings.length}`, "");
    lines.push("## Plan (all new rows as DRAFT)", "", "| Type | Key | Action | Changed fields |", "|---|---|---|---|");
    for (const p of plan)
      lines.push(`| ${p.kind} | ${p.key} | ${p.action}${p.backToDraft ? " → back to DRAFT (was VERIFIED)" : ""} | ${p.fields.join(", ") || "-"} |`);
    if (notInSheet.length) lines.push("", `In the database but not in the sheet (left unchanged, never deleted): ${notInSheet.join(", ")}`);
    lines.push("", "## Errors (block --write)", "", ...(errors.length ? errors.map((e) => `- **${e.where}**: ${e.msg}`) : ["- None"]));
    lines.push("", "## Warnings", "", ...(warnings.length ? warnings.map((e) => `- **${e.where}**: ${e.msg}`) : ["- None"]));

    // Facts summary per row: what will show and what will be "Not available yet"
    lines.push("", "## Filled facts per row", "");
    for (const c of colleges) {
      const empty = Object.entries(c).filter(([k, v]) => k !== "internalNotes" && (v === null || (Array.isArray(v) && !v.length))).map(([k]) => k);
      lines.push(`- **${c.slug}**: empty (Not available yet): ${empty.join(", ") || "none"}`);
    }
    for (const c of courses) {
      const empty = Object.entries(c).filter(([k, v]) => k !== "internalNotes" && (v === null || (Array.isArray(v) && !v.length))).map(([k]) => k);
      lines.push(`- **${c.collegeSlug}/${c.courseId}**: empty (Not available yet): ${empty.join(", ") || "none"}`);
    }

    const report = lines.join("\n") + "\n";
    const out = path.join(path.dirname(xlsxPath!), "import-report.md");
    fs.writeFileSync(out, report);
    console.log(report);
    console.log(`Report saved to ${out}`);

    if (!WRITE) {
      console.log("\nDRY RUN: nothing was written. Re-run with --write after the report is approved.");
      return;
    }
    if (errors.length) {
      console.error("\nNot written: fix the errors above first.");
      process.exitCode = 1;
      return;
    }

    // ----- Write (one transaction; upserts only, never deletes) -----
    const planByKey = new Map(plan.map((p) => [`${p.kind}:${p.key}`, p]));
    await prisma.$transaction(async (tx) => {
      const ids = new Map<string, string>(existing.map((c) => [c.slug, c.id]));
      for (const c of colleges) {
        const p = planByKey.get(`college:${c.slug}`)!;
        if (p.action === "unchanged") continue;
        const reset = p.action === "update" && p.backToDraft ? { status: "DRAFT" as const, verifiedAt: null } : {};
        const row = await tx.college.upsert({ where: { slug: c.slug }, create: { ...c, status: "DRAFT" }, update: { ...c, ...reset } });
        ids.set(c.slug, row.id);
      }
      for (const c of courses) {
        const p = planByKey.get(`course:${c.collegeSlug}/${c.courseId}`)!;
        if (p.action === "unchanged") continue;
        const collegeId = ids.get(c.collegeSlug)!;
        const { collegeSlug: _drop, ...data } = c;
        void _drop;
        const reset = p.action === "update" && p.backToDraft ? { status: "DRAFT" as const, verifiedAt: null } : {};
        await tx.course.upsert({
          where: { collegeId_courseId: { collegeId, courseId: c.courseId } },
          create: { ...data, collegeId, status: "DRAFT" },
          update: { ...data, ...reset },
        });
      }
    });
    console.log("\nWritten.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(String(e instanceof Error ? e.message : e).replace(/postgres(ql)?:\/\/\S+/g, "<url hidden>"));
  process.exit(1);
});
