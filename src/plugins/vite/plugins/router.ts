import type { Plugin } from "vite";
import { getListOpensyaConfig } from "../../../config/load.js";
import { existsSync } from "node:fs";
import { getChildren } from "../../../utils/get-children.js";
import path from "node:path";

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

type VueRoute = {
  path: string;
  component: string; // chemin de fichier, transformé en import() à la sérialisation
  children?: VueRoute[];
};

export function viteRouterPlugin(): Plugin {
  let pageEntries: RouteEntry[] = [];

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

  function resolveRouteEntry(pagesDir: string, filePath: string): RouteEntry {
    let normalized = path.relative(pagesDir, filePath).replaceAll("\\", "/");

    const ext = path.extname(normalized);
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

  async function getPages(pagesDir: string) {
    if (!existsSync(pagesDir)) return;

    const files = getChildren(pagesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(vue)$/,
    });

    for (const file of files) {
      pageEntries.push(resolveRouteEntry(pagesDir, file.path));
    }
  }

  function toImportPath(filePath: string): string {
    return filePath.replaceAll("\\", "/");
    // return path.relative(process.cwd(), filePath.replaceAll("\\", "/"));
  }

  function joinPath(base: string, sub: string): string {
    if (!sub) return base;
    return `${base}/${sub}`.replace(/\/+/g, "/");
  }

  /**
   * Convertit les enfants d'un noeud (route non-racine) en routes Vue.
   * `isTopLevel` = true pour les enfants directs de la racine (path absolu),
   * false pour les niveaux plus profonds (path relatif, imbriqué via `children`).
   */
  function buildChildRoutes(node: RouteTree, isTopLevel: boolean): VueRoute[] {
    const childRoutes: VueRoute[] = [];

    if (node.indexFile) {
      childRoutes.push({ path: "", component: node.indexFile });
    }

    for (const child of node.children) {
      childRoutes.push(...buildChildRoutes(child, false));
    }

    const path = isTopLevel ? `/${node.segment}` : node.segment;

    // Cas: on a un fichier "layout" (ex: user.vue) -> il porte les enfants
    if (node.file) {
      const route: VueRoute = { path, component: node.file };
      if (childRoutes.length > 0) route.children = childRoutes;
      return [route];
    }

    // Cas: pas de fichier layout, rien à remonter non plus
    if (childRoutes.length === 0) return [];

    // Cas: pas de layout mais des enfants (index et/ou children) existent
    // -> on remonte ces routes en préfixant leur path avec le segment courant
    return childRoutes.map((r) => ({
      ...r,
      path: joinPath(path, r.path),
    }));
  }

  function buildVueRoutes(tree: RouteTree): VueRoute[] {
    const routes: VueRoute[] = [];

    if (tree.file) {
      // rare, mais possible si "index-comme-racine" a aussi un fichier propre
      routes.push({ path: "/", component: tree.file });
    } else if (tree.indexFile) {
      routes.push({ path: "/", component: tree.indexFile });
    }

    for (const child of tree.children) {
      routes.push(...buildChildRoutes(child, true));
    }

    return routes;
  }

  function serializeRoutes(
    routes: VueRoute[],
    toImportPath: (f: string) => string,
  ): string {
    const json = JSON.stringify(routes, null, 2);

    const withImports = json.replace(
      /"component":\s*"([^"]+)"/g,
      (_match, filePath: string) =>
        `"component": () => import(${JSON.stringify(toImportPath(filePath))})`,
    );

    return `export const routes = ${withImports};\n`;
  }

  async function generateCode() {
    pageEntries = [];

    const configs = getListOpensyaConfig();

    for (const { _srcDir } of configs) {
      const pageDir = path.resolve(_srcDir, "app/pages");
      if (!existsSync(pageDir)) continue;

      await getPages(pageDir);
    }

    const tree = buildRouteTree(pageEntries);
    const vueRoutes = buildVueRoutes(tree);

    return serializeRoutes(vueRoutes, toImportPath);
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
