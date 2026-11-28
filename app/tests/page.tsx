import { permanentRedirect } from "next/navigation";

// There is no /tests list: the practice tests live at /opportunities (single MCQ tests stay at /tests/[id])
export default function TestsIndex() {
  permanentRedirect("/opportunities");
}
