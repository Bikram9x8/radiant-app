import type { Metadata } from "next";

// The page itself is a client component, so its title and robots rule live here
export const metadata: Metadata = {
  title: "Report a problem | Radiant Educations",
  description: "Tell us about a wrong fact, a broken link or anything else that is not working.",
  robots: { index: false, follow: true },
};

export default function ReportProblemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
