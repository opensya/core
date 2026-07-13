import type { HooksRegistry } from "@opensya/persistence";
import { atomicWriteFile } from "../../utils/atomic_write_ile.js";
import path from "node:path";
import { getDirs } from "../../utils/dirs.js";

export interface DatabaseHooksContext {
  hooks: HooksRegistry;
}

export type DatabaseHooksDefinition = (
  context: DatabaseHooksContext,
) => void | Promise<void>;

export function defineDatabaseHooks(
  definition: DatabaseHooksDefinition,
): DatabaseHooksDefinition {
  return definition;
}

export function generateHelperTypes() {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const rPath = path.relative(
    path.resolve(OUTPUT_DIR_SERVER, "database"),
    import.meta.filename,
  );

  const content = `declare global {
  const defineDatabaseHooks: (typeof import("${rPath}"))["defineDatabaseHooks"];
}

export {};
`;

  atomicWriteFile(
    path.resolve(OUTPUT_DIR_SERVER, "database/helpers.d.ts"),
    content,
  );
}

export function registerHelpers() {
  generateHelperTypes();
  Object.assign(globalThis, { defineDatabaseHooks });
}
