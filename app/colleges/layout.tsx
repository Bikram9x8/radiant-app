import { notFound } from "next/navigation";
import { SHOW_COLLEGES } from "@/lib/features";

// Colleges are behind the SHOW_COLLEGES switch (lib/features.ts, off by default):
// while it is off, every /colleges route returns 404 (before any database query).
export default function CollegesLayout({ children }: { children: React.ReactNode }) {
  if (!SHOW_COLLEGES) notFound();
  return children;
}
