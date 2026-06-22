import { join, relative } from "node:path";
import { getDirs } from "../../utils";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { TableMeta } from "./define";

const template = `import type { InferTable } from "{{core_db_helper_path}}";

type Table = (typeof import("{{import}}"))['default'];
type Row = InferTable<Table["columns"]>;

interface _Table {
  {{name}}: Row
}

declare module '{{core_db_tables_path}}' {
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

  const coreDbRablesPath = normalizeDir(
    relative(outputTablesDir, join(CORE_DIR_SERVER, "database/tables")),
  );

  const coreDbHelperPath = normalizeDir(
    relative(outputTablesDir, join(CORE_DIR_SERVER, "database/helper")),
  );

  const content = template
    .replaceAll("{{core_db_tables_path}}", coreDbRablesPath)
    .replaceAll("{{core_db_helper_path}}", coreDbHelperPath)
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", name)
    .replaceAll("{{typeName}}", typeName)
    .replaceAll("{{tableName}}", tableName);

  atomicWriteFile(join(outputTablesDir, `${tableName}.d.ts`), content);
}
