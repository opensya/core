import { join } from "node:path";
import { getDirs } from "../../utils";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";

const template = `
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: '{{out_path}}',
    schema: '{{schema_path}}',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL },
  });
`;

export function writeDrizzleConfig() {
  const { INPUT_DIR_SERVER, OUTPUT_DIR_SERVER } = getDirs();

  const outPath = normalizeDir(join(INPUT_DIR_SERVER, "database/migrations"));

  const schemaPath = normalizeDir(
    join(OUTPUT_DIR_SERVER, "database/schema.js"),
  );

  const content = template
    .replaceAll("{{out_path}}", outPath)
    .replaceAll("{{schema_path}}", schemaPath);

  atomicWriteFile(join(OUTPUT_DIR_SERVER, "drizzle.config.js"), content);
}
