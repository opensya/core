import { atomicWriteFile, normalizeDir, readJson } from "@opensya/utils";
import type { TableMeta } from "./helper";
import { join, relative } from "node:path";
import { getDirs } from "../../../utils";
import { writeTableType } from "./write_type";

const template = `import { createDrizzleTable } from '{{core_server_path}}'
import { readJson } from '@opensya/utils'
import { pgEnum } from "drizzle-orm/pg-core";

{{imports_columns}}

{{enums}}

export const _{{name}} = createDrizzleTable(
  '{{table_name}}', 
  {
    {{columns}}
  },
)
`;

const enumTemplate = `export const _{{enum_name}}_enum = pgEnum(
  '{{enum_name}}',
  [
    {{values}}
  ]
);
`;

export function generateTable(
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
  const enums: string[] = [];

  for (const key in meta.columns) {
    if (!Object.hasOwn(meta.columns, key)) continue;
    if (key === "default") continue;

    const column = meta.columns[key];
    const path = normalizeDir(relative(outputTablesDir, column.file));

    imports.push(`import { ${key} } from '${path}'`);
    columns.push(key);

    if (column.enumeration) {
      enums.push(
        enumTemplate
          .replaceAll("{{enum_name}}", column.enumeration.name)
          .replaceAll(
            "{{values}}",
            column.enumeration.values
              .map((value) => `'${value}'`)
              .join(",\n    "),
          ),
      );
    }
  }

  atomicWriteFile(
    join(outputTablesDir, `${meta.tableName}.js`),

    template
      .replaceAll("{{core_server_path}}", coreDirServer)

      .replaceAll("{{imports_columns}}", imports.join(";\n"))
      .replaceAll("{{columns}}", columns.join(",\n    "))

      .replaceAll("{{name}}", meta.name)
      .replaceAll("{{table_name}}", meta.tableName)

      .replaceAll("{{enums}}", enums.join("\n")),

    // .replaceAll(/\n\n/, "\n"),
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
    .map(([, meta]) => `export * from "./tables/${meta.tableName}";`)
    .join("\n");

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "database/tables.js"),
    `${content}\n`,
  );
}

export function generateSchemaJS() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const imports = [
    "export * from './tables.js';",
    "export * from './relations.js';",
  ];

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "database/schema.js"),
    `${imports.join("\n")}\n`,
  );
}
