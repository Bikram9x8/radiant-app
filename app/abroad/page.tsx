import type { Metadata } from "next";
import ComingSoonShell from "./ComingSoonShell";
import LandmarkScene from "@/components/abroad/scenes/LandmarkScene";
import Flag from "@/components/abroad/Flag";
import RouteMap from "@/components/abroad/RouteMap";
import s from "@/components/abroad/abroad.module.css";
import type { FlagCode, SceneCode } from "@/lib/abroad/types";

export const metadata: Metadata = { title: "Study abroad | Radiant Educations" };

// TEMPORARY (Part 2): preview of the illustrations, replaced by the real hub in Part 3.
// Names and drawings only, no numbers.
const PREVIEW: { code: SceneCode & FlagCode; name: string }[] = [
  { code: "ca", name: "Canada" },
  { code: "uk", name: "United Kingdom" },
  { code: "us", name: "USA" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "ie", name: "Ireland" },
];

// Study Abroad hub (built in Part 3). Reachable only when SHOW_ABROAD is on (see layout.tsx).
export default function AbroadHubPage() {
  return (
    <>
      <ComingSoonShell
        title="Study"
        accent="abroad"
        text="Country guides, exam prep and scholarships for Indian students, with the official source and date for every fact."
      />

      <section aria-label="Illustration preview" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pb-14">
        <div className="rounded-[18px] bg-ink p-4 sm:p-8">
          <RouteMap className="mx-auto max-w-[620px]" />
        </div>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Flags">
          {(["ca", "uk", "us", "au", "de", "ie", "nz", "eu"] as FlagCode[]).map((f) => (
            <Flag key={f} code={f} />
          ))}
        </div>
        <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEW.map((c) => (
            <li key={c.code} className={`${s.sceneHost} card overflow-hidden`}>
              <div className="h-[160px]">
                <LandmarkScene code={c.code} />
              </div>
              <p className="m-0 flex items-center gap-2.5 px-4 py-3 font-display text-2xl font-extrabold uppercase text-ink">
                <Flag code={c.code} />
                {c.name}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
