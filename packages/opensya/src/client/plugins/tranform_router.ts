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

type RouteTree = {
  segment: string;
  file: string | null;
  indexFile: string | null;
  children: RouteTree[];
};

type RouteEntry = {
  file: string;
  segments: string[];
  isIndex: boolean;
};

export function viteTransformRouterPlugin(): Plugin {
  const mainConfig = getOpensyaConfig();

  async function generateCode() {
    const entries = await getRoutes(mainConfig);
    const tree = buildRouteTree(entries);
    const routes = buildReactRoutes(tree);

    return `export const routes = ${routes};`;
  }

  function buildRouteTree(entries: RouteEntry[]): RouteTree {
    const root: RouteTree = {
      segment: "",
      file: null,
      indexFile: null,
      children: [],
    };

    for (const entry of entries) {
      let current = root;

      for (const segment of entry.segments) {
        let child = current.children.find((item) => item.segment === segment);

        if (!child) {
          child = {
            segment,
            file: null,
            indexFile: null,
            children: [],
          };

          current.children.push(child);
        }

        current = child;
      }

      if (entry.isIndex) {
        current.indexFile = entry.file;
      } else {
        current.file = entry.file;
      }
    }

    return root;
  }

  function buildReactRoutes(root: RouteTree): string {
    const routes = root.children.map((child) => nodeToCode(child, 1));

    if (root.indexFile) {
      routes.unshift(indexRouteToCode(root.indexFile, 1));
    }

    return `[\n${routes.join(",\n")}\n]`;
  }

  function nodeToCode(node: RouteTree, depth: number): string {
    const indent = "  ".repeat(depth);
    const propIndent = "  ".repeat(depth + 1);

    const props: string[] = [`${propIndent}path: "${node.segment}"`];

    if (node.file) {
      props.push(`${propIndent}lazy: ${lazyCode(node.file, depth + 1)}`);
    }

    const children: string[] = [];

    if (node.indexFile) {
      children.push(indexRouteToCode(node.indexFile, depth + 2));
    }

    for (const child of node.children) {
      children.push(nodeToCode(child, depth + 2));
    }

    if (children.length > 0) {
      props.push(
        `${propIndent}children: [\n${children.join(",\n")}\n${propIndent}]`,
      );
    }

    return `${indent}{\n${props.join(",\n")}\n${indent}}`;
  }

  function indexRouteToCode(file: string, depth: number): string {
    const indent = "  ".repeat(depth);
    const propIndent = "  ".repeat(depth + 1);

    return `${indent}{\n${propIndent}index: true,\n${propIndent}lazy: ${lazyCode(
      file,
      depth + 1,
    )}\n${indent}}`;
  }

  function lazyCode(file: string, depth: number): string {
    const indent = "  ".repeat(depth);
    const innerIndent = "  ".repeat(depth + 1);
    const importPath = toImportPath(file);

    return `async function()  {
${innerIndent}const module = await import("${importPath}");

${innerIndent}return {
${innerIndent}  Component: module.default,
${innerIndent}  handle: {
${innerIndent}    meta: module.meta,
${innerIndent}  },
${innerIndent}};
${indent}}`;
  }
  // ${innerIndent}  Component: () => React.createElement(Layout, null, React.createElement(module.default)),

  async function getRoutes(config: UseOpensyaConfig): Promise<RouteEntry[]> {
    const routes: RouteEntry[] = [];

    for (const module of config.modules) {
      const moduleConfig = await loadModuleOpensyaConfig(module);
      routes.push(...(await getRoutes(moduleConfig)));
    }

    const pagesDir = join(config._dirs.INPUT_DIR_CLIENT, "pages");

    if (!existsSync(pagesDir)) {
      return routes;
    }

    const files = getChildren(pagesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(jsx|tsx)$/,
    });

    for (const file of files) {
      routes.push(resolveRouteEntry(pagesDir, file.path));
    }

    return routes;
  }

  function resolveRouteEntry(pagesDir: string, filePath: string): RouteEntry {
    let normalized = relative(pagesDir, filePath).replaceAll("\\", "/");

    const ext = extname(normalized);
    normalized = normalized.slice(0, -ext.length);

    const rawSegments = normalized.split("/").filter(Boolean);
    const isIndex = rawSegments.at(-1) === "index";

    const segments = isIndex ? rawSegments.slice(0, -1) : rawSegments;

    return {
      file: filePath,
      segments: segments.map(toRouteSegment),
      isIndex,
    };
  }

  function toRouteSegment(segment: string): string {
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
  }

  function toImportPath(filePath: string): string {
    return filePath.replaceAll("\\", "/");
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
