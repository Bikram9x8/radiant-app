import { NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/mcq";
import { buildTemplateCsv, buildTemplateXlsx } from "@/lib/mcq-import";

// Import template: ?format=xlsx (default) or ?format=csv (UTF-8 with BOM)
export async function GET(req: Request) {
  if (!(await getAdminUserId())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv = new URL(req.url).searchParams.get("format") === "csv";
  const body = csv ? buildTemplateCsv() : await buildTemplateXlsx();

  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": csv
        ? "text/csv; charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="mcq-questions-template.${csv ? "csv" : "xlsx"}"`,
      "Cache-Control": "no-store",
    },
  });
}
