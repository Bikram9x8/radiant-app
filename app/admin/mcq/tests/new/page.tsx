import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUserId } from "@/lib/mcq";
import NewTestForm from "./NewTestForm";
import { backLink, pageIntro, pageTitle } from "../../ui";

export default async function NewMcqTestPage() {
  if (!(await getAdminUserId())) {
    redirect("/login");
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link href="/admin/mcq" className={backLink}>
        ← MCQ tests
      </Link>
      <h1 className={pageTitle}>New test</h1>
      <p className={`${pageIntro} mb-6`}>
        The test is saved as a draft. You add questions and publish it on the next page.
      </p>
      <NewTestForm />
    </div>
  );
}
