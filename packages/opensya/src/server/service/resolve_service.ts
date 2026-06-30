import path, { relative } from "node:path";
import { _ } from "@opensya/utils";
import type { ServiceMeta } from "./helper";

export function resolveServiceFromFilePath(
  parentDir: string,
  filePath: string,
): ServiceMeta {
  const normalized = relative(parentDir, filePath).replaceAll("\\", "/");
  const extension = path.extname(normalized);

  const segments = normalized
    .slice(0, -extension.length)
    .split("/")
    .filter((segment) => segment !== "index")
    .map((segment) => _.camelCase(segment));

  return {
    name: segments.join("."),
    file: filePath,
  };
}
