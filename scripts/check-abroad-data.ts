// Study Abroad data check. Runs before every build ("prebuild" in package.json).
// Fails (exit 1) when a fact has no source URL, source name or valid "last checked" date;
// only warns when a fact was last checked more than 180 days ago.
// Usage: npx tsx scripts/check-abroad-data.ts
import { COUNTRIES } from "../lib/abroad/countries";
import { EXAMS } from "../lib/abroad/exams";
import { SCHOLARSHIPS } from "../lib/abroad/scholarships";
import { RATES } from "../lib/abroad/rates";
import { validateAbroadData } from "../lib/abroad/validate";

const issues = validateAbroadData({ countries: COUNTRIES, exams: EXAMS, scholarships: SCHOLARSHIPS, rates: RATES });
const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");

for (const w of warnings) console.warn(`  warning  ${w.where}: ${w.message}`);
for (const e of errors) console.error(`  ERROR    ${e.where}: ${e.message}`);

const counts = `${COUNTRIES.length} countries, ${EXAMS.length} exams, ${SCHOLARSHIPS.length} scholarships, ${RATES.length} rates`;
if (errors.length > 0) {
  console.error(`Study Abroad data check FAILED (${errors.length} error(s), ${warnings.length} warning(s); ${counts}).`);
  process.exit(1);
}
console.log(`Study Abroad data check passed (${warnings.length} warning(s); ${counts}).`);
