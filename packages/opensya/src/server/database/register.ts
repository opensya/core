import { join } from "node:path";
import { getDirs } from "../../utils";
import { tables } from "./tables";
import { connectDatabase } from "./connection";
import { readJson } from "@opensya/utils";
import type { TableMeta } from "./table";

export async function registerDatabase() {
  await connectDatabase();

  const { OUTPUT_DIR_SERVER } = getDirs();
  const path = join(OUTPUT_DIR_SERVER, "database/tables.json");

  const metas = readJson<Record<string, TableMeta>>(path, {});
  for (const meta of Object.values(metas)) {
    const { default: content } = await import(meta.outputFile);
    Object.assign(tables, { [meta.name]: content });
  }
}
