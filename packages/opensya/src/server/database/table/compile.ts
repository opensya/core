import chokidar from "chokidar";
import { join, parse } from "node:path";
import { existsSync } from "node:fs";
import { atomicWriteFile, getChildren, readJson, _ } from "@opensya/utils";
import { REGEXS } from "../../utils";

import type { AnyEnhancedColumn, TableMeta } from "./helper";
import {
  generateTable,
  generateTablesJs,
  generateSchemaJS,
} from "./generate_table";
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
  let manifest = readJson<Record<string, TableMeta>>(manifestDir, {});

  generateSchemaJS();
  writeDrizzleConfig();

  const onFinish = _.debounce(async () => {
    manifest = {};

    await detectTables(getOpensyaConfig());

    atomicWriteFile(manifestDir, JSON.stringify(manifest, null, 2));

    for (const key in manifest) {
      if (!Object.hasOwn(manifest, key)) continue;
      generateTable(manifest, manifest[key].name);
    }

    generateRelations();
    generateTablesJs();
  }, 300);

  chokidar
    .watch(join(dirs.INPUT_DIR_SERVER, "database/tables"), {
      ignoreInitial: true,
    })
    .on("add", () => onFinish())
    .on("change", () => onFinish())
    .on("unlink", () => onFinish());

  onFinish();

  async function detectTables(config: UseOpensyaConfig) {
    const { OUTPUT_DIR_SERVER } = getDirs();

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      await detectTables(moduleConfig);
    }

    const tablesDir = join(config._dirs.INPUT_DIR_SERVER, "database/tables");

    if (!existsSync(tablesDir)) return;

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
          name,
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
    ) satisfies Record<string, TableMeta & { file: string }>;

    for (const key in tables) {
      if (!Object.hasOwn(tables, key)) continue;
      await writeTableManifest(manifest, tables[key]);
    }
  }

  async function writeTableManifest(
    manifest: Record<string, TableMeta>,
    meta: TableMeta & { file: string },
  ) {
    const columns = await loadJs<Record<string, AnyEnhancedColumn>>(meta.file);

    manifest[meta.name] ??= {
      outputFile: meta.outputFile,
      name: meta.name,
      tableName: meta.tableName,
      typeName: meta.typeName,
      columns: {},
    };

    const manifestData = manifest[meta.name];

    for (const key in columns) {
      if (!Object.hasOwn(columns, key)) continue;
      if (key === "default") continue;

      const column = columns[key];

      manifestData.columns[key] = {
        file: meta.file,
        relation: column._relation,
        enumeration: column._enumValues,
      };
    }

    manifest[meta.name] = manifestData;
  }
}
