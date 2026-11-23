// Which official source each shown fact comes from, so a source line only names the facts that page
// really covers. One fixed rule for every college (same as the template help text):
// - approval_source_url covers type, established_year, district and approved_by
// - basic_info_source_url covers city, state, pincode, full_address (and official_website)
// - every other *_source_url covers the facts right before it in the template
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

const GROUP: Record<FactKey, Group> = {
  type: "approval",
  year: "approval",
  district: "approval",
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
    .map((f) => ({ label: LABEL[f], src: c.src[GROUP[f]] }));
}
