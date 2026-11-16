import { NextResponse } from "next/server";
import { getAdminUserId, getMcqChapter } from "@/lib/mcq";
import { IMPORT_MAX_BYTES, parseImportFile, rowsToImport, saveImport } from "@/lib/mcq-import";

// Upload a question file for one chapter.
//   mode=preview: check every row, save nothing
//   mode=commit:  same checks on the same file (fingerprint must match), then save all rows at once
// All or nothing: commit is refused while any row has an error.
export async function POST(req: Request) {
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const chapterId = String(form?.get("chapterId") ?? "");
  const mode = form?.get("mode") === "commit" ? "commit" : "preview";
  if (!form || !(file instanceof File)) {
    return NextResponse.json({ error: "Please choose a file." }, { status: 400 });
  }
  if (file.size > IMPORT_MAX_BYTES) {
    return NextResponse.json({ error: "The file is larger than 2 MB. Split it into smaller files." }, { status: 400 });
  }

  const chapter = await getMcqChapter(chapterId);
  if (!chapter) {
    return NextResponse.json({ error: "Please choose a chapter in CBSE, ICSE or Competitive." }, { status: 400 });
  }

  const parsed = await parseImportFile(Buffer.from(await file.arrayBuffer()), file.name, chapter.id);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (mode === "preview") {
    return NextResponse.json({ fingerprint: parsed.fingerprint, format: parsed.format, rows: parsed.rows });
  }

  if (form.get("fingerprint") !== parsed.fingerprint) {
    return NextResponse.json(
      { error: "The file changed since you checked it. Check the file again before importing." },
      { status: 409 }
    );
  }
  const errors = parsed.rows.filter((r) => r.status === "error").length;
  if (errors > 0) {
    return NextResponse.json(
      { error: `Fix the ${errors} row${errors === 1 ? "" : "s"} with errors, then check the file again.` },
      { status: 400 }
    );
  }

  const questions = rowsToImport(parsed, form.get("importDuplicates") === "1");
  if (questions.length === 0) {
    return NextResponse.json({ error: "There are no questions to import in this file." }, { status: 400 });
  }

  let testTitle: string | null = null;
  if (form.get("createTest") === "1") {
    testTitle = String(form.get("testTitle") ?? "").normalize("NFC").trim();
    if (!testTitle || testTitle.length > 200) {
      return NextResponse.json({ error: "Please enter a test title of up to 200 characters." }, { status: 400 });
    }
  }

  const result = await saveImport(chapter.id, questions, testTitle);
  return NextResponse.json(result, { status: 201 });
}
