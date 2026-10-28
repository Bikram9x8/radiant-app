import { prisma } from "@/lib/prisma";

export const INTERNSHIPS_ROOT_SLUG = "higher-education";
export const INTERNSHIPS_STAGE_SLUG = "internships";
export const INTERNSHIPS_CATEGORY_SLUG = "internships";

// Guide/browse pages under each Internships stage; companies can't post to these.
export const NON_POSTABLE_INTERNSHIP_SLUGS = ["how-to-get-internship", "internship-by-company"];

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// True for an active SUBJECT under higher-education > LEVEL > internships (STAGE),
// excluding the guide pages above.
export async function isInternshipSubcategory(nodeId: string): Promise<boolean> {
  const node = await prisma.courseNode.findUnique({
    where: { id: nodeId },
    select: {
      kind: true,
      slug: true,
      isActive: true,
      parent: {
        select: {
          kind: true,
          slug: true,
          isActive: true,
          parent: {
            select: {
              kind: true,
              isActive: true,
              parent: { select: { kind: true, slug: true, parentId: true } },
            },
          },
        },
      },
    },
  });
  const stage = node?.parent;
  const level = stage?.parent;
  const root = level?.parent;
  return (
    !!node &&
    node.kind === "SUBJECT" &&
    node.isActive &&
    !NON_POSTABLE_INTERNSHIP_SLUGS.includes(node.slug) &&
    stage?.kind === "STAGE" &&
    stage.slug === INTERNSHIPS_STAGE_SLUG &&
    stage.isActive &&
    level?.kind === "LEVEL" &&
    level.isActive &&
    root?.kind === "COURSE" &&
    root.slug === INTERNSHIPS_ROOT_SLUG &&
    root.parentId === null
  );
}

export async function getInternshipsCategoryId(): Promise<string | null> {
  const category = await prisma.category.findUnique({ where: { slug: INTERNSHIPS_CATEGORY_SLUG } });
  return category?.id ?? null;
}

// applyDeadline comes from <input type="date">, so it's stored as midnight UTC of that date.
// Applications stay open until the end of that day in India (23:59:59 IST).
export function isDeadlinePassed(applyDeadline: Date, now: Date = new Date()): boolean {
  return now.getTime() >= applyDeadline.getTime() + DAY_MS - IST_OFFSET_MS;
}

export function cleanDuration(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, 100) || null;
}
