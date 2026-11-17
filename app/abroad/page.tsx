import type { Metadata } from "next";
import ComingSoonShell from "./ComingSoonShell";

export const metadata: Metadata = { title: "Study abroad | Radiant Educations" };

// Study Abroad hub (built in Part 3). Reachable only when SHOW_ABROAD is on (see layout.tsx).
export default function AbroadHubPage() {
  return (
    <ComingSoonShell
      title="Study"
      accent="abroad"
      text="Country guides, exam prep and scholarships for Indian students, with the official source and date for every fact."
    />
  );
}
