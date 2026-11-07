// Excel/CSV import for MCQ questions: reads .xlsx and UTF-8/UTF-16 CSV, checks every row with the
// same rules as the question editor, and reports problems row by row. Server only.
import { createHash, randomUUID } from "crypto";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { questionInput } from "@/lib/mcq";
import type { McqOptionKey } from "@/lib/mcq-shared";

export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
export const IMPORT_MAX_ROWS = 500;

const COLUMNS = ["question", "option_a", "option_b", "option_c", "option_d", "correct", "explanation", "image_url"] as const;
type Column = (typeof COLUMNS)[number];
const REQUIRED: Column[] = ["question", "option_a", "option_b", "option_c", "option_d", "correct"];

// Friendly names used in row messages
const LABELS: Record<Column, string> = {
  question: "question",
  option_a: "option A",
  option_b: "option B",
  option_c: "option C",
  option_d: "option D",
  correct: "correct",
  explanation: "explanation",
  image_url: "image_url",
};
const FIELD_TO_COLUMN: Record<string, Column> = {
  text: "question",
  optionA: "option_a",
  optionB: "option_b",
  optionC: "option_c",
  optionD: "option_d",
  correctOption: "correct",
  explanation: "explanation",
  imageUrl: "image_url",
};

export type ImportRowStatus = "ready" | "warning" | "error" | "example";

export type ImportRow = {
  rowNumber: number; // as Excel shows it (header is row 1)
  status: ImportRowStatus;
  question: string;
  correct: string;
  correctText: string;
  duplicate: boolean;
  messages: string[];
};

export type ImportQuestion = {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: McqOptionKey;
  explanation: string | null;
  imageUrl: string | null;
};

export type ParsedImport =
  | {
      ok: true;
      fingerprint: string;
      format: string; // e.g. "Excel (.xlsx)" or "CSV (UTF-8)"
      rows: ImportRow[];
      // Rows that pass all checks, in file order, keyed by row number
      valid: Map<number, ImportQuestion>;
    }
  | { ok: false; error: string };

// ================= TEMPLATE =================

// Two example rows (English and Hindi). Rows starting with "EXAMPLE" are skipped on import.
const TEMPLATE_ROWS: string[][] = [
  ["EXAMPLE – What is 2 + 2?", "3", "4", "5", "6", "B", "2 + 2 = 4", ""],
  ["EXAMPLE – 5 और 3 का योग कितना है?", "7", "8", "9", "10", "B", "5 + 3 = 8", ""],
];

const TEMPLATE_HELP = [
  "How to fill in the Questions sheet",
  "",
  "question: the question text (required).",
  "option_a, option_b, option_c, option_d: the four options (all required).",
  "correct: the letter of the correct option, A, B, C or D.",
  "explanation: optional, shown to students after they submit.",
  "image_url: optional, a link starting with https:// to an image for the question.",
  "",
  "Hindi and Punjabi are supported. Keep this file as .xlsx, or save CSV as “CSV UTF-8”.",
  "Rows whose question starts with EXAMPLE are skipped, so you can keep or delete them.",
  "Up to 500 questions per file. Every question goes into the chapter you choose on the import page.",
];

export async function buildTemplateXlsx(): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Questions");
  ws.columns = COLUMNS.map((c) => ({
    header: c,
    key: c,
    width: c === "question" ? 50 : c === "explanation" ? 36 : c === "image_url" ? 30 : c === "correct" ? 10 : 16,
  }));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  for (const r of TEMPLATE_ROWS) ws.addRow(r);
  for (let row = 2; row <= IMPORT_MAX_ROWS + 1; row++) {
    ws.getCell(`F${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"A,B,C,D"'],
      showErrorMessage: true,
      errorTitle: "Correct option",
      error: "Use A, B, C or D.",
    };
  }
  // Text format so Excel doesn't turn options like 1/2 or 3-4 into dates
  for (let c = 1; c <= COLUMNS.length; c++) ws.getColumn(c).numFmt = "@";

  const help = wb.addWorksheet("How to fill this in");
  help.getColumn(1).width = 100;
  TEMPLATE_HELP.forEach((line, i) => {
    const cell = help.getCell(`A${i + 1}`);
    cell.value = line;
    if (i === 0) cell.font = { bold: true };
  });

  return new Uint8Array(await wb.xlsx.writeBuffer());
}

export function buildTemplateCsv(): Uint8Array {
  const quote = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [COLUMNS.join(","), ...TEMPLATE_ROWS.map((r) => r.map(quote).join(","))];
  // BOM so Excel opens the Hindi row correctly
  return new TextEncoder().encode("﻿" + lines.join("\r\n") + "\r\n");
}

// ================= TEXT HELPERS =================

// NFC so identical-looking Devanagari/Gurmukhi compares equal; trim() keeps ZWJ/ZWNJ (not whitespace)
const clean = (s: string) => s.normalize("NFC").trim();
const headerKey = (s: string) => clean(s).toLowerCase().replace(/[\s_-]+/g, "");
const dupKey = (s: string) => clean(s).toLowerCase().replace(/\s+/g, " ");

const HEADER_MAP: Record<string, Column> = Object.fromEntries(COLUMNS.map((c) => [headerKey(c), c]));

// "??" inside text or U+FFFD usually means Hindi/Punjabi was lost when the file was saved
const looksDamaged = (s: string) => /�/.test(s) || /[^\s?]?\?\?/.test(s);

// ================= CSV =================

type Decoded = { text: string; format: string } | { error: string };

const NOT_UTF8 =
  "This CSV isn't saved as UTF-8, so Hindi or Punjabi text would be damaged. In Excel use File › Save As › “CSV UTF-8”, or upload the .xlsx file.";

function decodeCsv(buf: Buffer): Decoded {
  try {
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      return { text: new TextDecoder("utf-8", { fatal: true }).decode(buf.subarray(3)), format: "CSV (UTF-8)" };
    }
    if (buf[0] === 0xff && buf[1] === 0xfe) {
      return { text: new TextDecoder("utf-16le", { fatal: true }).decode(buf.subarray(2)), format: "Text (UTF-16)" };
    }
    if (buf[0] === 0xfe && buf[1] === 0xff) {
      return { text: new TextDecoder("utf-16be", { fatal: true }).decode(buf.subarray(2)), format: "Text (UTF-16)" };
    }
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(buf), format: "CSV (UTF-8)" };
  } catch {
    return { error: NOT_UTF8 };
  }
}

// RFC 4180 style: quoted fields, doubled quotes, commas/newlines inside quotes
function parseDelimited(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = { ",": 0, "\t": 0, ";": 0 };
  let inQ = false;
  for (const ch of firstLine) {
    if (ch === '"') inQ = !inQ;
    else if (!inQ && ch in counts) counts[ch as keyof typeof counts]++;
  }
  const delim = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ",") as string;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ================= XLSX =================

type CellResult = { text: string } | { error: string };

function cellToText(value: ExcelJS.CellValue, display: string): CellResult {
  if (value === null || value === undefined) return { text: "" };
  if (value instanceof Date) return { error: "looks like a date. Format the column as Text." };
  if (typeof value === "string") return { text: value };
  if (typeof value === "number") return { text: display || String(value) };
  if (typeof value === "boolean") return { text: value ? "TRUE" : "FALSE" };
  if ("error" in value) return { error: `shows the Excel error ${value.error}.` };
  if ("richText" in value) return { text: value.richText.map((r) => r.text).join("") };
  if ("formula" in value || "sharedFormula" in value) {
    const result = value.result;
    if (result === undefined || result === null) return { text: "" };
    if (result instanceof Date) return { error: "looks like a date. Format the column as Text." };
    if (typeof result === "object" && "error" in result) return { error: `shows the Excel error ${result.error}.` };
    return { text: String(result) };
  }
  if ("hyperlink" in value) {
    const t = value.text as unknown;
    if (typeof t === "string") return { text: t };
    if (t && typeof t === "object" && "richText" in t) {
      return { text: (t as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join("") };
    }
    return { text: value.hyperlink };
  }
  return { text: display };
}

type Grid = { cells: CellResult[][]; rowNumbers: number[] };

async function readXlsx(buf: Buffer): Promise<Grid | { error: string }> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
  } catch {
    return { error: "This file couldn't be read as an Excel .xlsx file. Save it again from Excel as .xlsx." };
  }
  const ws = wb.getWorksheet("Questions") ?? wb.worksheets[0];
  if (!ws) return { error: "The Excel file has no sheets." };

  const cells: CellResult[][] = [];
  const rowNumbers: number[] = [];
  const width = Math.max(ws.columnCount, COLUMNS.length);
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const line: CellResult[] = [];
    for (let c = 1; c <= width; c++) {
      const cell = row.getCell(c);
      line.push(cellToText(cell.value, cell.text));
    }
    cells.push(line);
    rowNumbers.push(rowNumber);
  });
  return { cells, rowNumbers };
}

// ================= MAIN =================

// Turns zod issues into short messages with the spreadsheet column names
function zodRowMessages(issues: { path: PropertyKey[]; code: string; message: string; maximum?: unknown }[]): string[] {
  return issues.map((issue) => {
    const column = FIELD_TO_COLUMN[String(issue.path[0])];
    const label = column ? LABELS[column] : String(issue.path[0] ?? "row");
    if (issue.code === "too_small") return `${label} is empty.`;
    if (issue.code === "too_big") return `${label} is longer than ${issue.maximum} characters.`;
    if (column === "image_url") return "image_url must start with https://.";
    return `${label}: ${issue.message}`;
  });
}

export async function parseImportFile(buf: Buffer, fileName: string, chapterId: string): Promise<ParsedImport> {
  if (buf.length === 0) return { ok: false, error: "The file is empty." };
  if (buf.length > IMPORT_MAX_BYTES) return { ok: false, error: "The file is larger than 2 MB. Split it into smaller files." };

  const lower = fileName.toLowerCase();
  let grid: Grid;
  let format: string;
  if (lower.endsWith(".xls")) {
    return { ok: false, error: "Old .xls files aren't supported. In Excel use File › Save As › Excel Workbook (.xlsx)." };
  } else if (lower.endsWith(".xlsx")) {
    const read = await readXlsx(buf);
    if ("error" in read) return { ok: false, error: read.error };
    grid = read;
    format = "Excel (.xlsx)";
  } else if (lower.endsWith(".csv") || lower.endsWith(".txt") || lower.endsWith(".tsv")) {
    const decoded = decodeCsv(buf);
    if ("error" in decoded) return { ok: false, error: decoded.error };
    const parsed = parseDelimited(decoded.text);
    grid = {
      cells: parsed.map((r) => r.map((text) => ({ text }))),
      rowNumbers: parsed.map((_, i) => i + 1),
    };
    format = decoded.format;
  } else {
    return { ok: false, error: "Please upload an .xlsx or .csv file." };
  }

  // ---------- header row ----------
  const header = grid.cells[0];
  if (!header) return { ok: false, error: "The file has no header row." };
  const columnIndex = new Map<Column, number>();
  header.forEach((cell, i) => {
    const key = "text" in cell ? HEADER_MAP[headerKey(cell.text)] : undefined;
    if (key && !columnIndex.has(key)) columnIndex.set(key, i);
  });
  const missing = REQUIRED.filter((c) => !columnIndex.has(c));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `The first row must be the header. Missing column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}. Download the template to see the layout.`,
    };
  }

  const dataRows = grid.cells.slice(1);
  const dataRowNumbers = grid.rowNumbers.slice(1);
  const nonEmpty = dataRows.filter((r) => r.some((c) => "error" in c || clean(c.text) !== "")).length;
  if (nonEmpty > IMPORT_MAX_ROWS) {
    return { ok: false, error: `The file has ${nonEmpty} question rows. The limit is ${IMPORT_MAX_ROWS} per import.` };
  }

  const existing = await prisma.mcqQuestion.findMany({
    where: { chapterId, isActive: true },
    select: { text: true },
  });
  const existingKeys = new Set(existing.map((q) => dupKey(q.text)));
  const seenInFile = new Map<string, number>();

  const rows: ImportRow[] = [];
  const valid = new Map<number, ImportQuestion>();

  dataRows.forEach((cells, i) => {
    const rowNumber = dataRowNumbers[i];
    const messages: string[] = [];
    const values = {} as Record<Column, string>;
    const cellErrors = new Set<Column>();

    for (const column of COLUMNS) {
      const idx = columnIndex.get(column);
      const cell = idx === undefined ? { text: "" } : (cells[idx] ?? { text: "" });
      if ("error" in cell) {
        messages.push(`${LABELS[column]} ${cell.error}`);
        cellErrors.add(column);
        values[column] = "";
      } else {
        values[column] = clean(cell.text);
      }
    }
    if (messages.length === 0 && COLUMNS.every((c) => values[c] === "")) return; // empty row

    const correct = values.correct.toUpperCase();
    const base = {
      rowNumber,
      question: values.question,
      correct,
      correctText: ["A", "B", "C", "D"].includes(correct) ? values[`option_${correct.toLowerCase()}` as Column] : "",
      duplicate: false,
    };

    // Template example rows start with "EXAMPLE" in capitals; "Examples of ..." is a real question
    if (/^EXAMPLE\b/.test(values.question)) {
      rows.push({ ...base, status: "example", messages: ["Example row, skipped."] });
      return;
    }

    if (cellErrors.has("correct")) {
      // already explained by the cell error
    } else if (!values.correct) {
      messages.push("correct is empty. Use A, B, C or D.");
    } else if (!["A", "B", "C", "D"].includes(correct)) {
      messages.push(`correct must be A, B, C or D (found “${values.correct}”).`);
    }
    const parsed = questionInput.safeParse({
      chapterId,
      text: values.question,
      optionA: values.option_a,
      optionB: values.option_b,
      optionC: values.option_c,
      optionD: values.option_d,
      correctOption: correct,
      explanation: values.explanation,
      imageUrl: values.image_url,
    });
    if (!parsed.success) {
      // correct and cells with an Excel problem are already explained above
      const issues = parsed.error.issues.filter((issue) => {
        const column = FIELD_TO_COLUMN[String(issue.path[0])];
        return issue.path[0] !== "correctOption" && !(column && cellErrors.has(column));
      });
      messages.push(...zodRowMessages(issues as Parameters<typeof zodRowMessages>[0]));
    }

    if (messages.length > 0) {
      rows.push({ ...base, status: "error", messages });
      return;
    }

    const warnings: string[] = [];
    let duplicate = false;
    const key = dupKey(values.question);
    const earlier = seenInFile.get(key);
    if (earlier !== undefined) {
      duplicate = true;
      warnings.push(`Same question as row ${earlier}.`);
    } else {
      seenInFile.set(key, rowNumber);
    }
    if (existingKeys.has(key)) {
      duplicate = true;
      warnings.push("Already in this chapter's question bank.");
    }
    if (COLUMNS.some((c) => looksDamaged(values[c]))) {
      warnings.push("This looks like damaged text (??). Check that the file was saved as UTF-8 or .xlsx.");
    }

    if (parsed.success) {
      const d = parsed.data;
      valid.set(rowNumber, {
        text: d.text,
        optionA: d.optionA,
        optionB: d.optionB,
        optionC: d.optionC,
        optionD: d.optionD,
        correctOption: d.correctOption,
        explanation: d.explanation,
        imageUrl: d.imageUrl,
      });
    }
    rows.push({ ...base, duplicate, status: warnings.length > 0 ? "warning" : "ready", messages: warnings });
  });

  return {
    ok: true,
    fingerprint: createHash("sha256").update(buf).digest("hex"),
    format,
    rows,
    valid,
  };
}

// Rows that would be saved: valid, not examples, and duplicates only when asked for
export function rowsToImport(parsed: Extract<ParsedImport, { ok: true }>, includeDuplicates: boolean): ImportQuestion[] {
  return parsed.rows
    .filter((r) => (r.status === "ready" || r.status === "warning") && (includeDuplicates || !r.duplicate))
    .map((r) => parsed.valid.get(r.rowNumber))
    .filter((q): q is ImportQuestion => !!q);
}

// One transaction: the questions, and optionally a draft test containing them in file order
export async function saveImport(
  chapterId: string,
  questions: ImportQuestion[],
  draftTestTitle: string | null
): Promise<{ imported: number; testId: string | null }> {
  const withIds = questions.map((q) => ({ ...q, id: randomUUID(), chapterId }));
  const testId = draftTestTitle ? randomUUID() : null;

  await prisma.$transaction([
    prisma.mcqQuestion.createMany({ data: withIds }),
    ...(testId && draftTestTitle
      ? [
          prisma.mcqTest.create({
            data: { id: testId, title: draftTestTitle, chapterId, isPublished: false },
          }),
          prisma.mcqTestQuestion.createMany({
            data: withIds.map((q, position) => ({ testId, questionId: q.id, position })),
          }),
        ]
      : []),
  ]);
  return { imported: withIds.length, testId };
}
