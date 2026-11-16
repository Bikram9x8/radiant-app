// Feature switches. NEXT_PUBLIC_* values are read at build time and work on both server and client;
// changing one means setting it in the hosting environment and redeploying.

// School Education (CBSE, ICSE, Vocational and School posts). OFF unless explicitly "true":
// while off, School pages and posts redirect (307) to /higher and are hidden from menus,
// search and lists. Nothing is deleted; set NEXT_PUBLIC_SHOW_SCHOOL=true to bring it all back.
export const SHOW_SCHOOL = process.env.NEXT_PUBLIC_SHOW_SCHOOL === "true";
