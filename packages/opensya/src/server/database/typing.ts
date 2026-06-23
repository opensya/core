import { join, relative } from "node:path";
import { getDirs } from "../../utils";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { TableMeta } from "./types";

const template = `import type { InferTable, DrizzleTableFromDefineTable } from "{{core_server_path}}";

type Table = (typeof import("{{import}}"))['default'];
type NamedTable = Table & { name: "{{tableName}}" };

type Row = InferTable<Table["columns"]>;
type DrizzleTable = DrizzleTableFromDefineTable<NamedTable>;

interface _Table {
  {{name}}: DrizzleTable
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
