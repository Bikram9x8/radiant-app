import { notFound } from "next/navigation";
import { SHOW_UPDATES } from "@/lib/features";

// Latest updates are behind the SHOW_UPDATES switch (lib/features.ts, off by default):
// while it is off, /updates returns 404 (before any database query).
export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  if (!SHOW_UPDATES) notFound();
  return children;
}
