import chokidar from "chokidar";
import { join, parse } from "node:path";
import { existsSync } from "node:fs";
import { atomicWriteFile, getChildren, readJson, _ } from "@opensya/utils";
import { REGEXS } from "../../utils";

import type { AnyEnhancedColumn, TableMeta } from "./helper";
import {
  writeDrizzleSchema,
  generateTablesJs,
  generateSchemaJS,
} from "./write_table_schema";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../../config";
import { getDirs } from "../../../utils";
import { loadJs } from "../../utils/load_js";
import { writeDrizzleConfig } from "../write_drizzle_config";
import { generateRelations } from "./generate_relation";

export async function compileTables() {
  const dirs = getDirs();
  const manifestDir = join(dirs.OUTPUT_DIR_SERVER, "database/tables.json");

  atomicWriteFile(manifestDir, "{}");
  generateSchemaJS();
  generateTablesJs();
  await detectTables(getOpensyaConfig());

  const onFinish = _.debounce(() => {
    writeDrizzleConfig();
    generateRelations();
    generateTablesJs();
  }, 300);

  onFinish();

  chokidar
    .watch(manifestDir)
    .on("add", () => onFinish)
    .on("change", () => onFinish);
}

async function detectTables(config: UseOpensyaConfig) {
  const { OUTPUT_DIR_SERVER } = getDirs();

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

      const outputFile = join(
        OUTPUT_DIR_SERVER,
        "database/tables",
        `${tableName}.js`,
      );

      return [
        tableName,
        {
          outputFile,
          name,
          tableName,
          typeName,
          file: file.path,
          columns: {},
          relations: {},
        },
      ];
    }),
  ) satisfies Record<string, TableMeta>;

  for (const key in tables) {
    if (!Object.hasOwn(tables, key)) continue;
    await compileTable(tables[key]);
  }
}

async function compileTable(meta: TableMeta & { file: string }) {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const manifestPath = join(OUTPUT_DIR_SERVER, "database/tables.json");

  const columns = await loadJs<Record<string, AnyEnhancedColumn>>(meta.file);

  const manifest = readJson<Record<string, TableMeta>>(manifestPath, {});
  manifest[meta.name] ??= meta;

  const manifestData = manifest[meta.name];

  for (const key in columns) {
    if (!Object.hasOwn(columns, key)) continue;
    if (key === "default") continue;

    const column = columns[key];
    const relation = column._relation;

    manifestData.columns[key] = { file: meta.file };
    manifestData.columns[key].relation = relation;
  }

  manifest[meta.name] = manifestData;

  atomicWriteFile(manifestPath, JSON.stringify(manifest, null, 2));
  writeDrizzleSchema(manifest, meta.name);
}
