import { join, parse } from "node:path";
import { existsSync } from "node:fs";
import { REGEXS } from "../../utils";
import { _, getChildren } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../../config";
import { loadDefaultJs } from "../../utils/load_js";
import { listen } from "../../utils/listen";
import type {
  RouteTransformerGlobalHandler,
  RouteTransformerMeta,
} from "./define";
import { transformers } from "../routes/transformers";

export async function compileTransformers() {
  await detectTransformers(getOpensyaConfig());

  async function detectTransformers(config: UseOpensyaConfig) {
    for (const module of config.modules) {
      const config = await loadModuleOpensyaConfig(module);
      await detectTransformers(config);
    }

    const dir = join(config._dirs.INPUT_DIR_SERVER, "controllers/transformers");
    if (!existsSync(dir)) return;

    const files = getChildren(dir, {
      onlyFile: true,
      endWith: REGEXS.acceptFiles,
    });

    const transformers = Object.fromEntries(
      files.map((file) => {
        const baseName = parse(file.name).name;

        const name = _.camelCase(baseName);
        const meta: RouteTransformerMeta = {
          name,
          file: file.path,
          global: baseName.endsWith(".global"),
        };

        return [meta.name, meta];
      }),
    ) satisfies Record<string, RouteTransformerMeta>;

    for (const key in transformers) {
      if (!Object.hasOwn(transformers, key)) continue;
      await compile(transformers[key]);
    }

    if (config._main) {
      listen(config, "controllers/transformers", detectTransformers);
    }
  }

  async function compile(meta: RouteTransformerMeta) {
    if (!meta.global) return;

    const transformer = await loadDefaultJs<RouteTransformerGlobalHandler>(
      meta.file,
    );
    if (!transformer) return;

    transformers[meta.name] = transformer();
  }
}
