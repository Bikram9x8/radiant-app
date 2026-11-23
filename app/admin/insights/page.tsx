import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import FadeIn from "@/components/FadeIn";

// Admin-only overview. Totals only: never student names, emails or phone numbers.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  { title: "Student activity", desc: "Sign-ups, MCQ tests and scores" },
  { title: "Data health", desc: "Draft vs verified data, stale facts and missing sources" },
  { title: "Website visitors", desc: "Visitor numbers from Vercel Web Analytics" },
  { title: "Google search", desc: "How the site appears in Google Search" },
];

export default async function AdminInsightsPage() {
  await requireAdmin();

  return (
    <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-8 text-ink">Insights</h1>

      {SECTIONS.map((section, i) => (
        <div key={section.title} className="mb-10">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
            {section.title}
          </h2>
          <FadeIn delay={i * 80}>
            <div className="glass glass-card rounded-2xl p-4">
              <p className="text-sm font-medium text-ink">Coming soon</p>
              <p className="text-xs text-muted mt-1">{section.desc}</p>
            </div>
          </FadeIn>
        </div>
      ))}
    </div>
  );
}
