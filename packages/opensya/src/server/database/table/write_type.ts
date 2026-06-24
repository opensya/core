import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { getDirs } from "../../../utils";

const template = `import type { createDrizzleTable } from "{{core_server_path}}";

type Definition = (typeof import("{{import}}"))['default'];
type Row = Definition["columns"];
type Table = ReturnType<typeof createDrizzleTable<'{{tableName}}', Row>>;

interface _Table {
  {{name}}: Table
}

declare module '{{core_server_path}}' {
  interface Tables extends _Table {}
}

declare global {
  type {{typeName}} = Row
}

export {};
`;

export function writeType({ file, tableName, typeName, name }: TableMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();

  const outputTablesDir = join(OUTPUT_DIR_SERVER, "database/tables");

  const rPath = normalizeDir(relative(outputTablesDir, file));

  const coreDirServer = normalizeDir(
    relative(outputTablesDir, CORE_DIR_SERVER),
  );

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", name)
    .replaceAll("{{typeName}}", typeName)
    .replaceAll("{{tableName}}", tableName);

  atomicWriteFile(join(outputTablesDir, `${tableName}.d.ts`), content);
}
