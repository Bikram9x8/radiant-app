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

export type InternshipLevelOption = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

// Levels under higher-education with their postable internship subcategories, in tree order.
// Mirrors isInternshipSubcategory, so the company forms only offer nodes the API accepts.
export async function getInternshipOptions(): Promise<InternshipLevelOption[]> {
  const levels = await prisma.courseNode.findMany({
    where: {
      kind: "LEVEL",
      isActive: true,
      parent: { kind: "COURSE", slug: INTERNSHIPS_ROOT_SLUG, parentId: null },
    },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      children: {
        where: { kind: "STAGE", slug: INTERNSHIPS_STAGE_SLUG, isActive: true },
        select: {
          children: {
            where: { kind: "SUBJECT", isActive: true, slug: { notIn: NON_POSTABLE_INTERNSHIP_SLUGS } },
            orderBy: { position: "asc" },
            select: { id: true, name: true },
          },
        },
      },
    },
  });
  return levels
    .map((l) => ({ id: l.id, name: l.name, subcategories: l.children.flatMap((s) => s.children) }))
    .filter((l) => l.subcategories.length > 0);
}

// Approved, still-open internships for a subcategory. Matches by subcategory slug, not node id,
// so a post linked under one level shows under all three levels. Newest first.
export async function getOpenInternshipsForSubcategory(subcategorySlug: string) {
  const posts = await prisma.opportunity.findMany({
    where: {
      type: "INTERNSHIP",
      status: "APPROVED",
      courseNode: {
        slug: subcategorySlug,
        kind: "SUBJECT",
        isActive: true,
        parent: {
          kind: "STAGE",
          slug: INTERNSHIPS_STAGE_SLUG,
          parent: {
            kind: "LEVEL",
            parent: { kind: "COURSE", slug: INTERNSHIPS_ROOT_SLUG, parentId: null },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      duration: true,
      stipendOrPrize: true,
      location: true,
      mode: true,
      applyDeadline: true,
      company: { select: { companyName: true } },
    },
  });
  return posts.filter((p) => !isDeadlinePassed(p.applyDeadline));
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
