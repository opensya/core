import { atomicWriteFile, normalizeDir, readJson } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { join, relative } from "node:path";
import { getDirs } from "../../../utils";

const template = `import { createDrizzleTable } from '{{core_server_path}}'
import table from '{{import}}';

table.name = "{{sql_table_name}}";

export const {{table_name}} = createDrizzleTable(table);
`;

export function writeDrizzleSchema(meta: TableMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();
  const outputTablesDir = join(OUTPUT_DIR_SERVER, "database/tables");

  const importPath = normalizeDir(relative(outputTablesDir, meta.file));

  const coreDirServer = normalizeDir(
    relative(outputTablesDir, CORE_DIR_SERVER),
  );

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
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
