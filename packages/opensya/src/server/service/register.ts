import { getDirs } from "../../utils";
import { join } from "node:path";

export async function registerServices() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  await import(join(OUTPUT_DIR_SERVER, "services/index.js"));
}
