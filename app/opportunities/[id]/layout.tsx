import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SHOW_SCHOOL } from "@/lib/features";
import { getCourseRootSlug, isSchoolPost } from "@/lib/school-posts";

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
