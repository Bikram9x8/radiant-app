// Which official source each shown fact comes from, so a source line only names the facts that page
// really covers. By default each fact uses its template group's source (e.g. type and year use
// basic_info_source_url). When a college's research notes record that a fact was taken from another
// group's source, add an override here; it is used only if that source is filled in.
import type { CollegeView, SourceRef } from "./types";

type Group = keyof CollegeView["src"];

export type FactKey =
  | "type"
  | "year"
  | "district"
  | "location"
  | "address"
  | "website"
  | "approval"
  | "naac"
  | "nirf"
  | "campus"
  | "hostel"
  | "phone"
  | "email";

const LABEL: Record<FactKey, string> = {
  type: "Type",
  year: "Year",
  district: "District",
  location: "Location",
  address: "Address",
  website: "Website",
  approval: "Approval",
  naac: "NAAC",
  nirf: "NIRF",
  campus: "Campus",
  hostel: "Hostel",
  phone: "Phone",
  email: "Email",
};

const DEFAULT_GROUP: Record<FactKey, Group> = {
  type: "basic",
  year: "basic",
  district: "basic",
  location: "basic",
  address: "basic",
  website: "basic",
  approval: "approval",
  naac: "naac",
  nirf: "nirf",
  campus: "facilities",
  hostel: "facilities",
  phone: "contact",
  email: "contact",
};

const OVERRIDES: Record<string, Partial<Record<FactKey, Group>>> = {
  // Notes (22 Nov 2026): established year and district are from the UGC list of State Private
  // Universities (approval_source_url, entry #313), which also gives the type (Private).
  // City, address and PIN are from the college's contact page (basic_info_source_url).
  "amity-university-mohali": { type: "approval", year: "approval", district: "approval" },
};

function hasValue(c: CollegeView, f: FactKey) {
  switch (f) {
    case "type":
      return !!c.type;
    case "year":
      return !!c.establishedYear;
    case "district":
      return !!c.district;
    case "location":
      return !!(c.city || c.state);
    case "address":
      return !!(c.fullAddress || c.pincode);
    case "website":
      return !!c.officialWebsite;
    case "approval":
      return c.approvedBy.length > 0;
    case "naac":
      return !!c.naacGrade;
    case "nirf":
      return !!c.nirfRank;
    case "campus":
      return !!c.campusAreaAcres;
    case "hostel":
      return !!c.hostel;
    case "phone":
      return !!c.admissionPhone;
    case "email":
      return !!c.admissionEmail;
  }
}

/** Source items for the facts a block shows (only facts that have a value), ready for <SourceList> */
export function factSources(c: CollegeView, facts: FactKey[]): { label: string; src: SourceRef | null }[] {
  return facts
    .filter((f) => hasValue(c, f))
    .map((f) => {
      const override = OVERRIDES[c.slug]?.[f];
      const src = (override && c.src[override]) || c.src[DEFAULT_GROUP[f]];
      return { label: LABEL[f], src };
    });
}
