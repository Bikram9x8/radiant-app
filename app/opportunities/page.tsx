import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import TestsPage from "./TestsPage";

// The full list of open practice tests (the Exams hub shows the first few). The list itself is a client
// component (TestsPage.tsx); this server page only adds the page title.
const TITLE = `Practice tests | ${SITE_NAME}`;
const DESCRIPTION = "Open practice tests for entrance exams: test series, chapter tests and DPPs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/opportunities") },
};

export default function Page() {
  return <TestsPage />;
}
