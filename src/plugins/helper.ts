import type { FastifyPluginCallback } from "fastify";
import fp, { type PluginMetadata } from "fastify-plugin";
import { getDirs } from "../utils/dirs.js";
import path from "path/posix";
import { atomicWriteFile } from "../utils/atomic-write-file.js";

export type PluginMeta = {
  name: string;
  file: string;
};

// export function definePlugin(
//   handler: FastifyPluginCallback,
//   options?: PluginMetadata,
// ) {
//   return fp(handler, options);
// }

export const definePlugin = fp;

export function generateHelperTypes() {
  const { OUTPUT_DIR_SERVER } = getDirs();

  const rPath = path.relative(
    path.resolve(OUTPUT_DIR_SERVER, "plugins"),
    import.meta.filename,
  );

  const content = `declare global {
  const definePlugin: (typeof import("${rPath}"))["definePlugin"];
}

export {};
`;

  atomicWriteFile(
    path.resolve(OUTPUT_DIR_SERVER, "plugins/helper.d.ts"),
    content,
  );
}
