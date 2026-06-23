import { join, relative } from "node:path";
import { getDirs } from "../../utils";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";

const template = `type Service = (typeof import("{{import}}"))['default']['service'];

interface _Service {
  {{name}}: Service
}

declare module '{{core_server_path}}' {
  interface Services extends _Service {}
}

export {};
`;

export function writeType(filePath: string, { name }: { name: string }) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();

  const outputServicesDir = join(OUTPUT_DIR_SERVER, "services");

  const rPath = normalizeDir(relative(outputServicesDir, filePath));

  const coreDirServer = normalizeDir(
    relative(outputServicesDir, CORE_DIR_SERVER),
  );

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", name);

  atomicWriteFile(join(OUTPUT_DIR_SERVER, `services/${name}.d.ts`), content);
}
