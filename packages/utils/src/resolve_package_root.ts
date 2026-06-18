import { dirname, join } from "node:path";
import { existsSync, statSync } from "node:fs";

export function resolvePackageRoot(packageName: string, from: string = process.cwd()): string {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`, {
      paths: [from],
    });

    return dirname(packageJsonPath);
  } catch (error) {
    throw new Error(`Unable to resolve package "${packageName}" from "${from}"`, {
      cause: error,
    });
  }
}

export function findPackageRoot(from: string): string {
  let currentDir = statSync(from).isDirectory() ? from : dirname(from);

  while (true) {
    const packageJsonPath = join(currentDir, "package.json");

    if (existsSync(packageJsonPath)) return currentDir;

    const parentDir = dirname(currentDir);

    if (parentDir === currentDir) {
      throw new Error(`Unable to find a package.json starting from "${from}"`);
    }

    currentDir = parentDir;
  }
}
