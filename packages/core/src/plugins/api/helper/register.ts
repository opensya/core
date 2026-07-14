import { appendPreHandler, defineRouteHandler } from "./route.js";
import { defineRouteMiddleware } from "./middleware.js";
import { getDirs } from "@/utils/dirs.js";
import path from "node:path";
import { atomicWriteFile } from "@/utils/atomic-write-file.js";

export function registerHelpers() {
  Object.assign(globalThis, {
    defineRouteHandler,
    appendPreHandler,
    defineRouteMiddleware,
  });

  generateHelperTypes();
}

export function generateHelperTypes() {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const rPath = path.relative(
    path.resolve(OUTPUT_DIR_SERVER, "api"),
    path.join(import.meta.dirname, "index.js"),
  );

  const content = `declare global {
  const defineRouteHandler: (typeof import("${rPath}"))["defineRouteHandler"];
  const appendPreHandler: (typeof import("${rPath}"))["appendPreHandler"];
  const defineRouteMiddleware: (typeof import("${rPath}"))["defineRouteMiddleware"];
}

export {};
`;

  atomicWriteFile(path.resolve(OUTPUT_DIR_SERVER, "api/helper.d.ts"), content);
}
