import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Returns the children of one node in the course tree.
// No parentId = the top level (CBSE, ICSE, Competitive, Vocational).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get("parentId") || null;

  const nodes = await prisma.courseNode.findMany({
    where: { parentId, isActive: true },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      kind: true,
      chapterNo: true,
      contentTypes: true,
    },
  });

  return NextResponse.json({ nodes });
}
