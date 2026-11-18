import { notFound } from "next/navigation";
import { SHOW_ABROAD } from "@/lib/features";

// Study Abroad is behind the SHOW_ABROAD switch (lib/features.ts, off by default):
// while it is off, every /abroad route returns 404.
export default function AbroadLayout({ children }: { children: React.ReactNode }) {
  if (!SHOW_ABROAD) notFound();
  return children;
}
