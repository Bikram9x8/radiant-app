import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, fitTitle, SITE_NAME } from "@/lib/site";
import { isTestPost, postKindLabel, postMetaParts } from "@/lib/test-posts";
import { SHOW_SCHOOL } from "@/lib/features";
import { getCourseRootSlug, isSchoolPost } from "@/lib/school-posts";

// Title and description from the post itself ("probability | Radiant Educations"). A post that is not
// approved (or does not exist) shows "not found" on the page, so it is not indexed.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await prisma.opportunity.findUnique({
    where: { id },
    select: { title: true, status: true, type: true, division: true, contentType: true, chapter: true, category: { select: { name: true } } },
  });
  if (!p || p.status !== "APPROVED") return { title: `Not found | ${SITE_NAME}`, robots: { index: false } };
  const kind = postKindLabel(p);
  const title = fitTitle(`${p.title} | ${SITE_NAME}`, p.title);
  const about = postMetaParts(p).join(" · ");
  const description = isTestPost(p)
    ? `${kind}: ${p.title}${about ? ` (${about})` : ""}. Free practice test on Radiant Educations.`
    : `${kind}: ${p.title}${about ? ` (${about})` : ""} on Radiant Educations.`;
  return { title, description, alternates: { canonical: absoluteUrl(`/opportunities/${id}`) } };
}

// School Education switched off (lib/features.ts): a School post's page redirects (307) to /higher.
// The page itself (page.tsx, a client component) is unchanged; this server layout runs first.
// Read-only: one lookup of the post and its course tree. Anything else renders as before
// (unknown ids still show the page's own "not found" message).
export default async function OpportunityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  if (!SHOW_SCHOOL) {
    const { id } = await params;
    const post = await prisma.opportunity.findUnique({
      where: { id },
      select: {
        status: true,
        type: true,
        division: true,
        contentType: true,
        courseNodeId: true,
        category: { select: { name: true } },
      },
    });
    if (post && post.status === "APPROVED" && isSchoolPost(post, await getCourseRootSlug(post.courseNodeId))) {
      redirect("/higher");
    }
  }
  return children;
}
