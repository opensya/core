import type { Plugin } from "vite";
import { extname, join, relative, dirname } from "node:path";
import { existsSync } from "node:fs";
import { getChildren } from "@opensya/utils";
import { getDirs } from "../../utils";

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
  return {
    name: "viteOpensyaTransformRouterlugin",
    enforce: "pre",

    transform(code, id) {
      const dirs = getDirs();
      const routerDir = join(dirs.CORE_DIR, "client/router");
      const isRouter = routerDir === id.replace(/\.[^/.]+$/, "");

      if (!isRouter) return;

      const routes: string = getRoutes(
        routerDir,
        join(dirs.INPUT_DIR, "client/pages"),
      );

      const _code = code.replace(
        /const routes = \[\];/,
        `const routes = [${routes}];`,
      );

      return _code;
    },
  };
}

function getRoutes(routerDir: string, pagesDir: string) {
  if (!existsSync(pagesDir)) return "";

  let routes: string = "";

  const pages = getChildren(pagesDir, {
    recursive: true,
    onlyFile: true,
    endWith: /\.(jsx|tsx)$/,
  });

  for (const page of pages) {
    const routePath = resolveRouteFromFilePath(pagesDir, page.path);
    const importPath = toImportPath(routerDir, page.path);

    routes += routeTemplate
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

export function resolveRouteFromFilePath(pagesDir: string, filePath: string) {
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
