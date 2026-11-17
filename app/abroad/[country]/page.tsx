import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCountry, verifiedCountries } from "@/lib/abroad";
import ComingSoonShell from "../ComingSoonShell";

// Only verified countries have a page; every other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return verifiedCountries().map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const c = getCountry(country);
  return { title: c ? `Study in ${c.name} | Radiant Educations` : "Study abroad | Radiant Educations" };
}

// Country page (built in Part 4)
export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) notFound();

  return (
    <ComingSoonShell
      crumb={{ href: "/abroad", label: "Study abroad" }}
      title="Study in"
      accent={c.name}
      text="This country guide is being prepared."
    />
  );
}
