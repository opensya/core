import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { getDirs } from "../../../utils";

const shareTemplate = `import type { createDrizzleTable } from "{{core_server_path}}";

type TColunms = {
  {{columns}}
};

type Table = ReturnType<typeof createDrizzleTable<'{{table_name}}', TColunms>>;

export {};`;

const serverTemplate = `${shareTemplate}

interface _Table {
  {{name}}: Table
}

declare module '{{core_server_path}}' {
  interface Tables extends _Table {}
}
`;

const clientTemplate = `${shareTemplate}

declare global {
 type {{type_name}} = Table
}
`;

export function writeTableType(meta: TableMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER, OUTPUT_DIR_CLIENT } = getDirs();

  const outputServerDir = join(OUTPUT_DIR_SERVER, "database/tables");
  const outputClientTablesDir = join(OUTPUT_DIR_CLIENT, "database/tables");

  function replacer(content: string, output: string) {
    const coreDirServer = normalizeDir(relative(output, CORE_DIR_SERVER));

    const columns: string[] = [];

    for (const key in meta.columns) {
      if (!Object.hasOwn(meta.columns, key)) continue;
      if (key === "default") continue;

      const path = normalizeDir(relative(output, meta.columns[key].file));

      columns.push(`${key}: typeof import('${path}').${key}`);
    }

    return content
      .replaceAll("{{core_server_path}}", coreDirServer)
      .replaceAll("{{name}}", meta.name)
      .replaceAll("{{type_name}}", meta.typeName)
      .replaceAll("{{table_name}}", meta.tableName)
      .replaceAll("{{columns}}", columns.join(",\n  "));
  }

  atomicWriteFile(
    join(outputServerDir, `${meta.tableName}.d.ts`),
    replacer(serverTemplate, outputServerDir),
  );

  atomicWriteFile(
    join(outputClientTablesDir, `${meta.tableName}.d.ts`),
    replacer(clientTemplate, outputClientTablesDir),
  );
}
