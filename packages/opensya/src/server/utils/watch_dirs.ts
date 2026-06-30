import { join } from "node:path";
import { existsSync } from "node:fs";

export function getWatchDirs(
  parentDir: string,
  dirs: string | string[],
): string[] {
  const _dirs: string[] = [];

  if (typeof dirs === "string") dirs = [dirs];

  for (const dir of dirs) {
    const _dir = join(parentDir, dir);
    if (existsSync(_dir)) _dirs.push(_dir);
  }

  return _dirs;
}
