import { join, parse } from "node:path";
import { existsSync } from "node:fs";
import { REGEXS } from "../../utils";
import { _, atomicWriteFile, getChildren, readJson } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../../config";
import { loadDefaultJs } from "../../utils/load_js";
import type {
  RouteTransformer,
  RouteTransformerGlobalHandler,
  RouteTransformerMeta,
} from "./helpers";
import {
  clearTransformers,
  globalTtransformers,
  transformers,
} from "../routes/transformers";
import { getDirs } from "../../../utils";

export async function compileTransformers() {
  const dirs = getDirs();
  const mainConfig = getOpensyaConfig();

  const manifestDir = join(
    dirs.OUTPUT_DIR_SERVER,
    "controllers/transformers.json",
  );

  const manifest = readJson<Record<string, RouteTransformerMeta>>(
    manifestDir,
    {},
  );

  clearTransformers();
  await detectTransformers(mainConfig);

  atomicWriteFile(manifestDir, JSON.stringify(manifest, undefined, 2));

  async function detectTransformers(config: UseOpensyaConfig) {
    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      await detectTransformers(moduleConfig);
    }

    const dir = join(config._dirs.INPUT_DIR_SERVER, "controllers/transformers");
    if (!existsSync(dir)) return;

    const files = getChildren(dir, {
      onlyFile: true,
      endWith: REGEXS.acceptFiles,
    });

    const transformerMetas = Object.fromEntries(
      files.map((file) => {
        const baseName = parse(file.name).name;
        const isGlobal = baseName.endsWith(".global");

        const name = _.camelCase(
          isGlobal ? baseName.replace(/\.global$/, "") : baseName,
        );

        const meta: RouteTransformerMeta = {
          name,
          file: file.path,
          global: isGlobal,
        };

        return [meta.name, meta];
      }),
    ) satisfies Record<string, RouteTransformerMeta>;

    for (const key in transformerMetas) {
      if (!Object.hasOwn(transformerMetas, key)) continue;
      await compile(transformerMetas[key]);
    }
  }

  async function compile(meta: RouteTransformerMeta) {
    // if (!meta.global) return;

    const transformer = await loadDefaultJs<RouteTransformer>(meta.file);

    if (!transformer) return;

    transformers[meta.name] = transformer;
    manifest[meta.name] = meta;

    if (meta.global) {
      globalTtransformers[meta.name] = (
        transformer as unknown as RouteTransformerGlobalHandler
      )();
    }
  }
}
