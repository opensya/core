import { join } from "node:path";
import { getDirs } from "../../utils";
import { tables } from "./tables";
import { connectDatabase } from "./connection";

export async function registerDatabase() {
  await connectDatabase();

  const { OUTPUT_DIR_SERVER } = getDirs();

  const imported = await import(join(OUTPUT_DIR_SERVER, "database/schema.js"));

  Object.assign(tables, imported);
}
