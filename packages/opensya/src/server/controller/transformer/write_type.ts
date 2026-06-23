import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import { getDirs } from "../../../utils";
import type { RouteTransformerMeta } from "./define";

const template = `type Transformer = (typeof import("{{import}}"))['default'];

interface _Transformers {
  {{name}}: Transformer['handler'];
}

declare module '{{core_server_path}}' {
  interface Transformers extends _Transformers {}
}

export {};
`;

export function writeType(meta: RouteTransformerMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();

  const outpuTransformerDir = join(
    OUTPUT_DIR_SERVER,
    "controllers/transformers",
  );

  const rPath = normalizeDir(relative(outpuTransformerDir, meta.file));

  const coreDirServer = normalizeDir(
    relative(outpuTransformerDir, CORE_DIR_SERVER),
  );

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", meta.name);

  atomicWriteFile(join(outpuTransformerDir, `${meta.name}.d.ts`), content);
}
