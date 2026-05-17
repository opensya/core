import { existsSync, readFileSync, statSync } from 'fs-extra';
import { dirname, join, resolve } from 'node:path';

export function resolvePackageTypes(packageName: string) {
  const result = findNearestPackageJson(require.resolve(packageName));
  if (!result) return null;

  const { packageJsonPath, packageDir } = result;

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
    types?: string;
    typings?: string;
  };

  const typesPath = packageJson.types ?? packageJson.typings ?? 'index.d.ts';
  const resolvedTypesPath = resolve(packageDir, typesPath);

  return existsSync(resolvedTypesPath) ? resolvedTypesPath : null;
}

/**
 * Retourne le chemin absolu du package.json le plus proche
 * depuis un fichier ou un dossier.
 */
export function findNearestPackageJson(
  inputPath: string,
): { packageDir: string; packageJsonPath: string } | null {
  let currentPath = resolve(inputPath);

  // Si c'est un fichier → on prend son dossier parent
  if (existsSync(currentPath) && statSync(currentPath).isFile()) {
    currentPath = dirname(currentPath);
  }

  while (true) {
    const packageJsonPath = join(currentPath, 'package.json');

    if (existsSync(packageJsonPath)) {
      return { packageDir: currentPath, packageJsonPath };
    }

    const parentPath = dirname(currentPath);

    // On est arrivé à la racine
    if (parentPath === currentPath) {
      return null;
    }

    currentPath = parentPath;
  }
}

export function resolvePackageDir(packageName: string): string {
  const packageJsonPath = require.resolve(`${packageName}/package.json`);

  const dir = dirname(packageJsonPath);

  if (!existsSync(packageJsonPath)) {
    throw new Error(`Unable to resolve package directory for "${packageName}"`);
  }

  return dir;
}
