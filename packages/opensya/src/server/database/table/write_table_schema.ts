import { atomicWriteFile, normalizeDir, readJson } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { join, relative } from "node:path";
import { getDirs } from "../../../utils";
import { writeTableType } from "./write_type";

const template = `import { createDrizzleTable } from '{{core_server_path}}'
import { readJson } from '@opensya/utils'

{{imports_columns}}

export default createDrizzleTable(
  '{{sql_table_name}}', 
  {
    {{columns}}
  },
)
`;

export function writeDrizzleSchema(
  manifest: Record<string, TableMeta>,
  name: string,
) {
  const meta = manifest[name];

  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();
  const outputTablesDir = join(OUTPUT_DIR_SERVER, "database/tables");

  const coreDirServer = normalizeDir(
    relative(outputTablesDir, CORE_DIR_SERVER),
  );

  const imports: string[] = [];
  const columns: string[] = [];

  for (const key in meta.columns) {
    if (!Object.hasOwn(meta.columns, key)) continue;
    if (key === "default") continue;

    const path = normalizeDir(
      relative(outputTablesDir, meta.columns[key].file),
    );

    imports.push(`import { ${key} } from '${path}'`);
    columns.push(key);
  }

  atomicWriteFile(
    join(outputTablesDir, `${meta.tableName}.js`),

    template
      .replaceAll("{{core_server_path}}", coreDirServer)

      .replaceAll("{{imports_columns}}", imports.join(";\n"))
      .replaceAll("{{columns}}", columns.join(",\n    "))

      .replaceAll("{{table_name}}", meta.name)
      .replaceAll("{{sql_table_name}}", meta.tableName),
  );

  if (process.argv.includes("--dev")) writeTableType(meta);
}

export function generateTablesJs() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const metas = readJson<Record<string, TableMeta>>(
    join(OUTPUT_DIR_SERVER, "database/tables.json"),
    {},
  );

  const content = Object.entries(metas)
    .map(
      ([, meta]) =>
        `export { default as ${meta.name} } from "./tables/${meta.tableName}";`,
    )
    .join("\n");

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "database/tables.js"),
    `${content}\n`,
  );
}

export function generateSchemaJS() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const imports = ["export * from './tables';", "export * from './relations';"];

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "database/schema.js"),
    `${imports.join("\n")}\n`,
  );
}
