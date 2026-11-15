import type { NextConfig } from "next";
import { SHOW_SCHOOL } from "./lib/features";

// While School Education is switched off (lib/features.ts), its pages redirect to /higher.
// permanent: false = HTTP 307, so search engines and browsers don't remember it and the
// pages come back as soon as NEXT_PUBLIC_SHOW_SCHOOL=true is set and the site is rebuilt.
// School posts (/opportunities/<id>) are redirected in app/opportunities/[id]/layout.tsx.
const SCHOOL_PATHS = [
  "/school",
  "/school/:path*",
  "/courses", // the "All courses" page lists CBSE and ICSE
  "/courses/cbse",
  "/courses/cbse/:path*",
  "/courses/icse",
  "/courses/icse/:path*",
  "/courses/vocational",
  "/courses/vocational/:path*",
];

const nextConfig: NextConfig = {
  async redirects() {
    if (SHOW_SCHOOL) return [];
    return SCHOOL_PATHS.map((source) => ({ source, destination: "/higher", permanent: false }));
  },
};

export default nextConfig;
