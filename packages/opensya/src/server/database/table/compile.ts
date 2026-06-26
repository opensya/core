import { join, parse } from "node:path";
import { existsSync } from "node:fs";
import { atomicWriteFile, getChildren, readJson, _ } from "@opensya/utils";
import { REGEXS } from "../../utils";

import type { AnyDrizzleColumnBuilder, TableMeta } from "./helper";
import {
  writeDrizzleSchema,
  writeDrizzleSchemaIndex,
} from "./write_table_schema";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../../config";
import { getDirs } from "../../../utils";
import { loadJs } from "../../utils/load_js";
import { writeDrizzleConfig } from "../write_drizzle_config";

export async function compileTables() {
  const dirs = getDirs();
  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "database/tables.json");

  atomicWriteFile(manifestDir, "{}");
  writeDrizzleSchemaIndex();
  await detectTables(getOpensyaConfig());
  writeDrizzleConfig();
}

async function detectTables(config: UseOpensyaConfig) {
  for (const module of config.modules) {
    const config = await loadModuleOpensyaConfig(module);
    await detectTables(config);
  }

  const tablesDir = join(config._dirs.INPUT_DIR_SERVER, "database/tables");

  if (!existsSync(tablesDir)) return {};

  const files = getChildren(tablesDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  const tables = Object.fromEntries(
    files.map((file) => {
      const baseName = parse(file.name).name;

      const name = _.camelCase(baseName);
      const tableName = _.snakeCase(baseName);
      const typeName = _.upperFirst(_.camelCase(baseName));

      return [
        tableName,
        {
          name,
          tableName,
          typeName,
          file: file.path,
          columns: {},
        },
      ];
    }),
  ) satisfies Record<string, TableMeta>;

  for (const key in tables) {
    if (!Object.hasOwn(tables, key)) continue;
    await compileTable(tables[key]);
  }

  writeDrizzleSchemaIndex();
}

async function compileTable(meta: TableMeta & { file: string }) {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const manifestPath = join(OUTPUT_DIR_SERVER, "database/tables.json");

  const columns = await loadJs<Record<string, AnyDrizzleColumnBuilder>>(
    meta.file,
  );

  const manifest = readJson<Record<string, TableMeta>>(manifestPath, {});
  manifest[meta.name] ??= meta;

  for (const key in columns) {
    if (!Object.hasOwn(columns, key)) continue;
    if (key === "default") continue;

    manifest[meta.name].columns[key] = { file: meta.file };
  }

  atomicWriteFile(manifestPath, JSON.stringify(manifest, null, 2));
  writeDrizzleSchema(manifest[meta.name]);
}
