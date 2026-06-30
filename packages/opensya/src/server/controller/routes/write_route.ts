import { atomicWriteFile, normalizeDir, readJson } from "@opensya/utils";
import type { RouteMeta } from "./helpers";
import { getDirs } from "../../../utils";
import { join, relative } from "node:path";

const template = `import { createFastifyRoute } from '{{core_server_path}}'
import route from '{{import}}';

const meta = {{meta}}

export const {{route_name}} = await createFastifyRoute(meta, route);
`;

export function writeFastifyRoute(meta: RouteMeta) {
  const { OUTPUT_DIR_SERVER, CORE_DIR_SERVER } = getDirs();
  const outputRoutesDir = join(OUTPUT_DIR_SERVER, "controllers/routes");

  const importPath = normalizeDir(relative(outputRoutesDir, meta.file));

  const coreDirServer = normalizeDir(
    relative(outputRoutesDir, CORE_DIR_SERVER),
  );

  const content = template
    .replaceAll("{{core_server_path}}", coreDirServer)
    .replaceAll("{{import}}", importPath)
    .replaceAll("{{meta}}", JSON.stringify(meta, undefined, 2))
    .replaceAll("{{route_name}}", meta.name);

  atomicWriteFile(join(outputRoutesDir, `${meta.idx}.js`), content);
}

export function writeFastifyRouteIndex() {
  const { OUTPUT_DIR_SERVER } = getDirs();
  const metas = readJson<Record<string, RouteMeta>>(
    join(OUTPUT_DIR_SERVER, "controllers/routes.json"),
    {},
  );

  const content = Object.entries(metas)
    .map(([, meta]) => `export * from "./routes/${meta.idx}";`)
    .join("\n");

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, "controllers/routes.js"),
    `${content}\n`,
  );
}
