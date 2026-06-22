import { join, relative } from "node:path";
import { getDirs } from "../../utils";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";

const template = `type Service = (typeof import("{{import}}"))['default']['service'];

declare global {
  function useService(name: '{{name}}'): Service;
}

export {};
`;

export function writeType(filePath: string, { name }: { name: string }) {
  const dirs = getDirs();

  const rPath = normalizeDir(
    relative(join(dirs.OUTPUT_DIR_SERVER, "types"), filePath),
  );

  const content = template
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", name);

  atomicWriteFile(
    join(dirs.OUTPUT_DIR_SERVER, `services/${name}.d.ts`),
    content,
  );
}
