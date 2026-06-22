import type { Plugin } from "vite";
import { extname, join, relative, dirname } from "node:path";
import { existsSync } from "node:fs";
import { getChildren } from "@opensya/utils";
import { getDirs } from "../../utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";

const routeTemplate = `
  {
    path: '{{path}}',
    lazy: async () => {
      const module = await import('{{import}}');
      return { Component: module.default };
    },
  },
`;

export function viteTransformRouterPlugin(): Plugin {
  const dirs = getDirs();
  const routerDir = join(dirs.CORE_DIR_CLIENT, "router");
  const mainConfig = getOpensyaConfig();

  // function getRoutes(routerDir: string, pagesDir: string) {
  async function getRoutes(config: UseOpensyaConfig) {
    const routes: Record<string, string> = {};

    for (const module of config.modules) {
      const config = await loadModuleOpensyaConfig(module);
      Object.assign(routes, await getRoutes(config));
    }

    const pagesDir = join(config._dirs.INPUT_DIR_CLIENT, "pages");
    if (!existsSync(pagesDir)) return {};

    const pages = getChildren(pagesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(jsx|tsx)$/,
    });

    for (const page of pages) {
      const routePath = resolveRouteFromFilePath(pagesDir, page.path);
      const importPath = toImportPath(routerDir, page.path);

      routes[routePath] = routeTemplate
        .replaceAll("{{path}}", routePath)
        .replaceAll("{{import}}", importPath);
    }

    return routes;
  }

  function toImportPath(routerDir: string, filePath: string) {
    const relativePath = relative(dirname(routerDir), filePath).replaceAll(
      "\\",
      "/",
    );
    return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
  }

  function resolveRouteFromFilePath(pagesDir: string, filePath: string) {
    let normalized = relative(pagesDir, filePath).replaceAll("\\", "/");

    const ext = extname(normalized);
    normalized = normalized.slice(0, -ext.length);

    const segments = normalized.split("/");

    const routeSegments = segments
      .filter((segment) => segment !== "index")
      .map((segment) => {
        const catchAllMatch = /^\[\.\.\.(.+)\]$/.exec(segment);

        if (catchAllMatch) {
          return `:${catchAllMatch[1]}*`;
        }

        const optionalMatch = /^\[\[(.+)\]\]$/.exec(segment);

        if (optionalMatch) {
          return `:${optionalMatch[1]}?`;
        }

        const dynamicMatch = /^\[(.+)\]$/.exec(segment);

        if (dynamicMatch) {
          return `:${dynamicMatch[1]}`;
        }

        return segment;
      });

    return "/" + routeSegments.join("/");
  }

  return {
    name: "viteOpensyaTransformRouterlugin",
    enforce: "pre",

    async transform(code, id) {
      const isRouter = routerDir === id.replace(/\.[^/.]+$/, "");

      if (!isRouter) return;

      const routes = await getRoutes(mainConfig);
      const _code = code.replace(
        /const routes = \[\];/,
        `const routes = [${Object.values(routes).join("\n")}];`,
      );

      return _code;
    },
  };
}
