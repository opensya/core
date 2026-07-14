import { readFileSync, statSync } from "fs";
import { dirname, join, parse } from "path";

// --- Interfaces ---

export interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  types?: string;
  typings?: string;
  module?: string;
  type?: "commonjs" | "module";
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// --- Helper Functions ---

/**
 * Finds and loads the nearest package.json by walking up the directory tree.
 *
 * @param startPath - Starting file or directory path. Defaults to `process.cwd()`.
 */
export function findAndReadPackageJson(
  startPath: string = process.cwd(),
): PackageJson {
  let currentDir = startPath;

  try {
    const pathStat = statSync(startPath);
    if (pathStat.isFile()) {
      currentDir = dirname(startPath);
    }
  } catch {
    currentDir = dirname(startPath);
  }

  while (true) {
    const potentialPackageJsonPath = join(currentDir, "package.json");

    try {
      const fileStat = statSync(potentialPackageJsonPath);
      if (fileStat.isFile()) {
        const content = readFileSync(potentialPackageJsonPath, "utf-8");
        return JSON.parse(content) as PackageJson;
      }
    } catch {
      // Continue walking up if file is not found
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir || parse(currentDir).root === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  throw new Error(
    `Could not find any "package.json" walking up from: "${startPath}"`,
  );
}
