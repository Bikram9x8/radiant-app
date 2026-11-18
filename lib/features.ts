// Feature switches. NEXT_PUBLIC_* values are read at build time and work on both server and client;
// changing one means setting it in the hosting environment and redeploying.

// School Education (CBSE, ICSE, Vocational and School posts). OFF unless explicitly "true":
// while off, School pages and posts redirect (307) to /higher and are hidden from menus,
// search and lists. Nothing is deleted; set NEXT_PUBLIC_SHOW_SCHOOL=true to bring it all back.
export const SHOW_SCHOOL = process.env.NEXT_PUBLIC_SHOW_SCHOOL === "true";

// Study Abroad (/abroad: countries, exams, scholarships). OFF unless explicitly "true":
// while off, every /abroad route returns 404 and there is no menu or footer link.
// Turn it on only when the facts in lib/abroad/* are verified (each with an official source and date).
export const SHOW_ABROAD = process.env.NEXT_PUBLIC_SHOW_ABROAD === "true";
