import { readFile } from "node:fs/promises";
import path from "node:path";

// The database is the JSON in public/database/ (database.json, and one file per shelf). The pages read it here.
export async function loadDatabase() {
  const file = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "database", "database.json");
  return JSON.parse(await readFile(/* turbopackIgnore: true */ file, "utf8"));
}
