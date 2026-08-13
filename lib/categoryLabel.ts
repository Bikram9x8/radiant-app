export function getShortLabel(categoryName?: string | null): string {
  if (!categoryName) return "";

  const classMatch = categoryName.match(/class\s*(\d{1,2})/i);
  if (classMatch) return classMatch[1];

  const knownExams = ["JEE", "NEET", "CUET", "CAT", "NDA", "CLAT", "UG", "CA"];
  const upper = categoryName.toUpperCase();
  const exam = knownExams.find((e) => upper.includes(e));
  if (exam) return exam;

  return categoryName.split(/[\s-]/)[0].slice(0, 4).toUpperCase();
}