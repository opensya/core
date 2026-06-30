import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import type { ServiceMeta } from "./helper";
import { join, relative } from "node:path";
import { getDirs } from "../../utils";

const template = `import { createService} from '{{core_server_path}}'
import {{name}}Service from '{{import}}'

Object.assign(globalThis, { {{name}}: createService({{name}}Service) })
`;

const typeTemplate = `declare global {
  const {{name}}: (typeof import("{{import}}"))["default"];
}

export {};
`;

export function generateService(
  manifest: Record<string, ServiceMeta>,
  name: string,
) {
  const meta = manifest[name];

  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();
  const outputDir = join(OUTPUT_DIR_SERVER, "services");

  const rPath = normalizeDir(relative(outputDir, meta.file));
  const coreDirServer = normalizeDir(relative(outputDir, CORE_DIR_SERVER));

  atomicWriteFile(
    join(outputDir, `${meta.name}.js`),

    template
      .replaceAll("{{core_server_path}}", coreDirServer)
      .replaceAll("{{import}}", rPath)
      .replaceAll("{{name}}", meta.name),
  );
}

export function generateType({ name, file }: ServiceMeta) {
  if (!process.argv.includes("--dev")) return;

  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();
  const outputServicesDir = join(OUTPUT_DIR_SERVER, "services");
  const rPath = normalizeDir(relative(outputServicesDir, file));

  const coreDirServer = normalizeDir(
    relative(outputServicesDir, CORE_DIR_SERVER),
  );

  const content = typeTemplate
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{import}}", rPath)
    .replaceAll("{{name}}", name);

  atomicWriteFile(join(OUTPUT_DIR_SERVER, `services/${name}.d.ts`), content);
}

export function generateServices(metas: Record<string, ServiceMeta>) {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const imports: string[] = [];

  for (const service in metas) {
    if (!Object.hasOwn(metas, service)) continue;

    const meta = metas[service];

    generateService(metas, meta.name);
    generateType(meta);

    imports.push(`import './${meta.name}';`);
  }

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "services/index.js"),
    imports.join("\n"),
  );
}
