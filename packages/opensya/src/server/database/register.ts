import { join } from "node:path";
import { getDirs } from "../../utils";
import { connectDatabase } from "./connection";
import { tables } from "./tables";

export async function registerDatabase() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const path = join(OUTPUT_DIR_SERVER, "database/schema.js");

  connectDatabase();
  await import(path);

  Object.assign(globalThis, { tables });
}
