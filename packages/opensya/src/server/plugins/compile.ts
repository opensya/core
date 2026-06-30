import chokidar from "chokidar";
import { join, parse, relative } from "node:path";
import { existsSync } from "node:fs";
import { atomicWriteFile, getChildren, _, readJson } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { REGEXS } from "../utils";
import { getDirs } from "../../utils";
import type { PluginMeta } from "./helper";
import { loadDefaultJs } from "../utils/load_js";

export async function compilePlugins() {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const manifestDir = join(OUTPUT_DIR_SERVER, "plugins/plugins.json");
  let manifest = readJson<Record<string, PluginMeta>>(manifestDir, {});

  const onFinish = _.debounce(async () => {
    manifest = {};

    await detectPlugins(getOpensyaConfig());

    atomicWriteFile(manifestDir, JSON.stringify(manifest, undefined, 2));
    writePluginsJs();
  }, 300);

  chokidar
    .watch(getPluginsWatchDirs(getOpensyaConfig()), { ignoreInitial: true })
    .on("add", () => onFinish())
    .on("change", () => onFinish())
    .on("unlink", () => onFinish());

  onFinish();

  async function detectPlugins(config: UseOpensyaConfig) {
    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      await detectPlugins(moduleConfig);
    }

    const pluginsDir = join(config._dirs.INPUT_DIR_SERVER, "plugins");

    if (!existsSync(pluginsDir)) return;

    const files = getChildren(pluginsDir, {
      recursive: true,
      onlyFile: true,
      endWith: REGEXS.acceptFiles,
    });

    for (const file of files) {
      const baseName = parse(file.name).name;
      const name = _.camelCase(baseName);

      const content = await loadDefaultJs(file.path);
      if (!content) continue;

      manifest[name] = { name, file: file.path };
    }
  }

  function writePluginsJs() {
    const { OUTPUT_DIR_SERVER } = getDirs();
    const outputPlugins = join(OUTPUT_DIR_SERVER, "plugins");

    const imports: string[] = [];
    const exports: string[] = [];

    for (const key in manifest) {
      if (!Object.hasOwn(manifest, key)) continue;

      const plugin = manifest[key];
      const importName = `${plugin.name}Plugin`;

      let importPath = relative(outputPlugins, plugin.file);
      importPath = importPath.replaceAll("\\", "/");

      if (!importPath.startsWith(".")) {
        importPath = `./${importPath}`;
      }

      imports.push(`import ${importName} from "${importPath}";`);
      exports.push(importName);
    }

    const content = `${imports.join("\n")}

export const plugins = [
${exports.map((name) => `  ${name},`).join("\n")}
];
`;

    atomicWriteFile(join(outputPlugins, "plugins.js"), content);
  }

  function getPluginsWatchDirs(config: UseOpensyaConfig): string[] {
    const dirs: string[] = [];

    const pluginsDir = join(config._dirs.INPUT_DIR_SERVER, "plugins");

    if (existsSync(pluginsDir)) dirs.push(pluginsDir);

    return dirs;
  }
}
