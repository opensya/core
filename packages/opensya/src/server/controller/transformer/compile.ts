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
import { clearTransformers, transformers } from "../routes/transformers";

export async function compileTransformers() {
  clearTransformers();

  await detectTransformers(getOpensyaConfig());

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

    if (config._main) {
      listen(config, "controllers/transformers", async () => {
        clearTransformers();
        await detectTransformers(config);
      });
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
