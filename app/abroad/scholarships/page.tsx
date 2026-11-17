import type { Metadata } from "next";
import ComingSoonShell from "../ComingSoonShell";

export const metadata: Metadata = { title: "Scholarships abroad | Radiant Educations" };

// Scholarships list (built in Part 6). Reachable only when SHOW_ABROAD is on (see ../layout.tsx).
export default function AbroadScholarshipsPage() {
  return (
    <ComingSoonShell
      crumb={{ href: "/abroad", label: "Study abroad" }}
      title="Scholarships"
      accent="abroad"
      text="Fully funded and partial scholarships for Indian students, each linked to its official page."
    />
  );
}
