import { _, atomicWriteFile, normalizeDir, readJson } from "@opensya/utils";
import type { TableMeta } from "./define";
import { getDirs } from "../../utils";
import { join, relative } from "node:path";

const template = `import { createDrizzleTable } from '{{core_db_helper_path}}'
import table from '{{import}}';

table.name ??= "{{sql_table_name}}";

export const {{table_name}} = createDrizzleTable(table);
`;

export function writeDrizzleSchema(meta: TableMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();
  const outputTablesDir = join(OUTPUT_DIR_SERVER, "database/tables");

  const importPath = normalizeDir(relative(outputTablesDir, meta.file));
  const coreDbHelperPath = normalizeDir(
    relative(outputTablesDir, join(CORE_DIR_SERVER, "database/helper")),
  );

  const content = template
    .replaceAll("{{core_db_helper_path}}", coreDbHelperPath)
    .replaceAll("{{import}}", importPath)
    .replaceAll("{{table_name}}", meta.name)
    .replaceAll("{{sql_table_name}}", meta.tableName);

  atomicWriteFile(join(outputTablesDir, `${meta.tableName}.js`), content);
}

export function writeDrizzleSchemaIndex() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const metas = readJson<Record<string, TableMeta>>(
    join(OUTPUT_DIR_SERVER, "database/tables.json"),
    {},
  );

  const content = Object.entries(metas)
    .map(([, meta]) => `export * from "./tables/${meta.tableName}";`)
    .join("\n");

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "database/schema.js"),
    `${content}\n`,
  );
}
