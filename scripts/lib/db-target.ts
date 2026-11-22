// Picks the database for the data scripts (import-colleges, verify-college) from an explicit env file,
// and protects the main database: --write is refused when the target host is the same as the one in
// .env (the live site's database) unless --main is also passed on purpose. Never prints URLs or keys.

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function readDbUrl(file: string) {
  const m = fs.readFileSync(file, "utf8").match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
  if (!m) throw new Error(`No DATABASE_URL in ${path.basename(file)}`);
  return m[1];
}

const host = (url: string) => new URL(url).hostname.replace("-pooler", "");

export function openDb(dbFile: string, opts: { write: boolean; allowMain: boolean }) {
  const url = readDbUrl(dbFile);
  const mainEnv = path.join(process.cwd(), ".env");
  const isMain = fs.existsSync(mainEnv) && host(readDbUrl(mainEnv)) === host(url);
  console.log(`Database: ${path.basename(dbFile)} (${isMain ? "MAIN database" : "not the main database"})`);
  if (opts.write && isMain && !opts.allowMain) {
    throw new Error("Refusing to write: this is the MAIN database (same host as .env). Pass --main only when that is approved.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}
