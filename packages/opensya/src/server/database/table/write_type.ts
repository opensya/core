import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { getDirs } from "../../../utils";

const template = `import type { createDrizzleTable } from "{{core_server_path}}";

type TColunms = {
  {{columns}}
}

type Table = ReturnType<typeof createDrizzleTable<'{{table_name}}', TColunms>>;

interface _Table {
   {{name}}: Table
}

declare module '{{core_server_path}}' {
  interface Tables extends _Table {}
}

export {};
`;

export function writeTableType(meta: TableMeta) {
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
    columns.push(`${key}: typeof import('${path}').${key}`);
  }

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{name}}", meta.name)
    .replaceAll("{{typeName}}", meta.typeName)
    .replaceAll("{{table_name}}", meta.tableName)
    .replaceAll("{{columns}}", columns.join(",\n  "));

  atomicWriteFile(join(outputTablesDir, `${meta.tableName}.d.ts`), content);
}
