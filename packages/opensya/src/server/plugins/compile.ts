import chokidar from "chokidar";
import { join, parse, relative } from "node:path";
import { existsSync } from "node:fs";
import { atomicWriteFile, getChildren, _ } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";
import { REGEXS } from "../utils";
import { getDirs } from "../../utils";
import type { PluginMeta } from "./helper";

export async function compilePlugins() {
  generatePluginsJs();

  await detectPlugins(getOpensyaConfig());

  const onFinish = _.debounce(async () => {
    await detectPlugins(getOpensyaConfig());
  }, 300);

  chokidar
    .watch(getPluginsWatchDirs(getOpensyaConfig()))
    .on("add", () => onFinish())
    .on("change", () => onFinish())
    .on("unlink", () => onFinish());
}

async function detectPlugins(config: UseOpensyaConfig) {
  const plugins: Record<string, PluginMeta> = {};

  for (const module of config.modules) {
    const moduleConfig = await loadModuleOpensyaConfig(module);
    Object.assign(plugins, await detectPlugins(moduleConfig));
  }

  const pluginsDir = join(config._dirs.INPUT_DIR_SERVER, "plugins");

  if (!existsSync(pluginsDir)) return plugins;

  const files = getChildren(pluginsDir, {
    recursive: true,
    onlyFile: true,
    endWith: REGEXS.acceptFiles,
  });

  for (const file of files) {
    const baseName = parse(file.name).name;
    const name = _.camelCase(baseName);

    plugins[name] = {
      name,
      file: file.path,
    };
  }

  writePluginsJs(plugins);

  return plugins;
}

function generatePluginsJs() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const outputFile = join(OUTPUT_DIR_SERVER, "plugins", "plugins.js");

  atomicWriteFile(outputFile, "export const plugins = [];\n");
}

function writePluginsJs(plugins: Record<string, PluginMeta>) {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const outputPlugins = join(OUTPUT_DIR_SERVER, "plugins");

  const imports: string[] = [];
  const exports: string[] = [];

  for (const key in plugins) {
    if (!Object.hasOwn(plugins, key)) continue;

    const plugin = plugins[key];
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
