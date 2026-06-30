import { join, relative } from "node:path";
import { getDirs } from "../../utils";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { ServiceMeta } from "./helper";

const template = `declare global {
  const {{name}}: (typeof import("{{import}}"))["default"];
}

export {};
`;

export function writeType({ name, file }: ServiceMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();

  const outputServicesDir = join(OUTPUT_DIR_SERVER, "services");
  const rPath = normalizeDir(relative(outputServicesDir, file));

  const coreDirServer = normalizeDir(
    relative(outputServicesDir, CORE_DIR_SERVER),
  );

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", name);

  atomicWriteFile(join(OUTPUT_DIR_SERVER, `services/${name}.d.ts`), content);
}
