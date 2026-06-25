import type { Plugin } from "vite";
import { extname, join, relative } from "node:path";
import { existsSync } from "node:fs";
import { getChildren } from "@opensya/utils";
import {
  getOpensyaConfig,
  loadModuleOpensyaConfig,
  type UseOpensyaConfig,
} from "../../config";

const VIRTUAL_ID = "virtual:router";
const RESOLVED_VIRTUAL_ID = "\0virtual:router";

const routeTemplate = `
{
  path: "{{path}}",
  lazy: async () => {
    const context = {
      _meta: undefined,
    };

    const module = await withPageMetaContext(context, async () => {
      return import("{{import}}");
    });

    return {
      Component: module.default,
      handle: {
        meta: module.meta ?? context._meta,
      }
    };
  },
}
`;

export function viteTransformRouterPlugin(): Plugin {
  const mainConfig = getOpensyaConfig();

  async function getRoutes(config: UseOpensyaConfig): Promise<string[]> {
    const routes: string[] = [];

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      routes.push(...(await getRoutes(moduleConfig)));
    }

    const pagesDir = join(config._dirs.INPUT_DIR_CLIENT, "pages");

    if (!existsSync(pagesDir)) {
      return routes;
    }

    const pages = getChildren(pagesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(jsx|tsx)$/,
    });

    for (const page of pages) {
      const routePath = resolveRouteFromFilePath(pagesDir, page.path);
      const importPath = toImportPath(page.path);

      routes.push(
        routeTemplate
          .replaceAll("{{path}}", routePath)
          .replaceAll("{{import}}", importPath),
      );
    }

    return routes;
  }

  function toImportPath(filePath: string) {
    return filePath.replaceAll("\\", "/");
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

    const path = "/" + routeSegments.join("/");

    return path === "/" ? "/" : path.replace(/\/+$/, "");
  }

  async function generateCode() {
    const routes = await getRoutes(mainConfig);

    return `import { withPageMetaContext } from "@core/client/page-meta";

export const routes = [
${routes.join(",\n")}
];
`;
  }

  return {
    name: "vite-opensya-router",
    enforce: "pre",

    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
    },

    async load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      return generateCode();
    },
  };
}
