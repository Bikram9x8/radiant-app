// Which posts count as "School" (hidden while SHOW_SCHOOL is off, see lib/features.ts).
// Server-only (uses Prisma). The same rule exists twice: isSchoolPost() for one post,
// schoolPostWhere / notSchoolWhere for database lists. Keep them in step.
//
// A post is School when it is not an internship, not linked to the Higher Education course
// tree, and EITHER
//   - it is a board-level test (division BOARD_LEVEL_TEST: board exams are School), OR
//   - it is not a test (other tests stay visible as entrance exam prep; rule in lib/test-posts.ts)
//     and ANY of these holds:
//       - it is linked to the CBSE, ICSE or Vocational course tree
//       - its division is NCERT_SOLUTION or CBSE_SAMPLE_PAPERS
//       - its type is SOLUTION, or its contentType is SOLUTION or NOTES
//       - its category is a school class ("Class N - Subject")
import type { Division, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EXPLICIT_TEST_DIVISIONS, SCHOOL_TEST_DIVISION, isTestPost } from "@/lib/test-posts";

export const SCHOOL_ROOT_SLUGS = ["cbse", "icse", "vocational"];
export const HIGHER_ROOT_SLUG = "higher-education";
export const SCHOOL_DIVISIONS = ["NCERT_SOLUTION", "CBSE_SAMPLE_PAPERS"];
// Tests in BOARD_LEVEL_TEST are School too (board exams), unlike other tests.
// Defined in lib/test-posts.ts so client components can use it as well.
export { SCHOOL_TEST_DIVISION };
const SCHOOL_CONTENT_TYPES = ["SOLUTION", "NOTES"];
const CLASS_CATEGORY_PREFIX = "Class ";

// ---------- one post ----------

type PostFields = {
  type: string;
  division?: string | null;
  contentType?: string | null;
  category?: { name: string } | null;
};

export function isSchoolPost(p: PostFields, rootSlug: string | null) {
  if (p.type === "INTERNSHIP") return false;
  if (rootSlug === HIGHER_ROOT_SLUG) return false;
  if (p.division === SCHOOL_TEST_DIVISION) return true;
  if (isTestPost(p)) return false;
  return (
    (rootSlug !== null && SCHOOL_ROOT_SLUGS.includes(rootSlug)) ||
    SCHOOL_DIVISIONS.includes(p.division ?? "") ||
    p.type === "SOLUTION" ||
    SCHOOL_CONTENT_TYPES.includes(p.contentType ?? "") ||
    (p.category?.name ?? "").startsWith(CLASS_CATEGORY_PREFIX)
  );
}

// Slug of the top course a node belongs to (null if no node / broken chain). Read-only.
export async function getCourseRootSlug(courseNodeId: string | null): Promise<string | null> {
  let nextId = courseNodeId;
  let slug: string | null = null;
  for (let depth = 0; nextId && depth < 10; depth++) {
    const node: { slug: string; parentId: string | null } | null = await prisma.courseNode.findUnique({
      where: { id: nextId },
      select: { slug: true, parentId: true },
    });
    if (!node) return null;
    slug = node.slug;
    nextId = node.parentId;
  }
  return nextId ? null : slug;
}

// ---------- database lists ----------

// Course node that sits anywhere under one of these top courses (up to 6 levels deep)
function underRoots(slugs: string[]): Prisma.CourseNodeWhereInput {
  const levels: Prisma.CourseNodeWhereInput[] = [];
  let cur: Prisma.CourseNodeWhereInput = { slug: { in: slugs }, parentId: null };
  for (let i = 0; i < 6; i++) {
    levels.push(cur);
    cur = { parent: cur };
  }
  return { OR: levels };
}

const testWhere: Prisma.OpportunityWhereInput = {
  OR: [{ type: "QUIZ" }, { division: { in: EXPLICIT_TEST_DIVISIONS as Division[] } }],
};

export const schoolPostWhere: Prisma.OpportunityWhereInput = {
  AND: [
    { NOT: { type: "INTERNSHIP" } },
    // Not under Higher Education (posts without a course node pass this check)
    { OR: [{ courseNodeId: null }, { NOT: { courseNode: underRoots([HIGHER_ROOT_SLUG]) } }] },
    {
      OR: [
        // Board-level tests are School
        { division: SCHOOL_TEST_DIVISION as Division },
        // Other tests are not; non-tests are School when any marker matches
        {
          AND: [
            { NOT: testWhere },
            {
              OR: [
                { courseNode: underRoots(SCHOOL_ROOT_SLUGS) },
                { division: { in: SCHOOL_DIVISIONS as Division[] } },
                { type: "SOLUTION" },
                { contentType: { in: SCHOOL_CONTENT_TYPES } },
                { category: { name: { startsWith: CLASS_CATEGORY_PREFIX } } },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Use in list queries while SHOW_SCHOOL is off
export const notSchoolWhere: Prisma.OpportunityWhereInput = { NOT: schoolPostWhere };
