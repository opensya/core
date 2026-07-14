import { readFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import type { PackageJson } from "./read-package-json.js";

interface DependencyInfo {
  name: string;
  version: string;
  path: string | null;
}

interface PackageDependenciesResult {
  packageName: string;
  packagePath: string;
  dependencies: DependencyInfo[];
}

/**
 * Robustly resolves a package root directory, avoiding "exports" subpath restriction issues.
 */
export function resolvePackageDir(
  packageName: string,
  callerPath: string = process.cwd(),
): string {
  const requireFn = createRequire(join(callerPath, "package.json"));

  // 1. Resolve the package's main entry point (e.g., node_modules/c12/dist/index.mjs)
  const mainEntryPoint = requireFn.resolve(packageName);

  // 2. Walk up from the entry point until we find the correct package.json directory
  let currentDir = dirname(mainEntryPoint);
  while (true) {
    try {
      const packageJsonPath = join(currentDir, "package.json");
      const pkg = JSON.parse(
        readFileSync(packageJsonPath, "utf-8"),
      ) as PackageJson;
      if (pkg.name === packageName) {
        return currentDir;
      }
    } catch {
      // Keep traversing up if package.json is missing or doesn't match the package name
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  throw new Error(
    `Could not locate the root directory for package "${packageName}"`,
  );
}

/**
 * Resolves a target dependency and retrieves all its listed dependencies along with their installation paths.
 *
 * @param dependencyName - Name of the target dependency (e.g., "c12")
 * @param callerPath - Path of the caller file/directory to resolve from. Defaults to `process.cwd()`.
 */
export function getDependencyTree(
  dependencyName: string,
  callerPath: string = process.cwd(),
): PackageDependenciesResult {
  try {
    // Resolve the root directory of the target dependency without hitting "exports" package.json errors
    const targetPackageDir = resolvePackageDir(dependencyName, callerPath);
    const targetPackageJsonPath = join(targetPackageDir, "package.json");

    // Read the target dependency's package.json
    const packageJsonContent = JSON.parse(
      readFileSync(targetPackageJsonPath, "utf-8"),
    ) as PackageJson;

    const rawDependencies = {
      ...packageJsonContent.dependencies,
      ...packageJsonContent.peerDependencies,
    };

    const dependencyList: DependencyInfo[] = [];

    // Resolve directories for each sub-dependency
    for (const [name, versionSpec] of Object.entries(rawDependencies)) {
      let resolvedPath: string | null = null;

      try {
        resolvedPath = resolvePackageDir(name, targetPackageJsonPath);
      } catch {
        // Fallback to null if a dependency isn't installed (e.g., optional peerDependency)
        resolvedPath = null;
      }

      dependencyList.push({
        name,
        version: versionSpec as string,
        path: resolvedPath,
      });
    }

    return {
      packageName: dependencyName,
      packagePath: targetPackageDir,
      dependencies: dependencyList,
    };
  } catch (error) {
    throw new Error(
      `Failed to load or parse dependency "${dependencyName}": ${(error as Error).message}`,
    );
  }
}
