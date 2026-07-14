/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Removes the property at the specified path of an object.
 * Identical behavior to lodash.unset.
 *
 * @param object - The object to modify.
 * @param path - The path of the property to unset (string like 'a.b[0].c' or string/number array).
 * @returns `true` if the property is deleted, otherwise `false`.
 */
export function unset(
  object: any,
  path: string | (string | number)[],
): boolean {
  if (object === null || object === undefined) {
    return true;
  }

  const parsedPath = Array.isArray(path) ? path : parsePath(path);

  if (parsedPath.length === 0) {
    return false;
  }

  // En typant 'current' comme Record<string | number, any>,
  // TypeScript nous autorise à l'indexer dynamiquement avec nos clés.
  let current: Record<string | number, any> = object;

  // Traverse the object up to the parent of the target key
  for (let i = 0; i < parsedPath.length - 1; i++) {
    const key = parsedPath[i];
    if (!key) continue;

    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return true; // Path already does not exist
    }
    current = current[key];
  }

  const lastKey = parsedPath[parsedPath.length - 1]!;
  if (
    current === null ||
    current === undefined ||
    typeof current !== "object"
  ) {
    return true;
  }

  return delete current[lastKey];
}

/**
 * Helper to parse string paths like 'a.b[0].c' or 'a.[1].b' into ['a', 'b', '0', 'c']
 */
function parsePath(pathStr: string): string[] {
  const result: string[] = [];
  const pathRegex = /[^.[\]]+|\[(?:([^"'][^\]]*)|(["'])(.*?)\2)\]/g;

  pathStr.replace(pathRegex, (match, expression, quote, subString) => {
    const key = quote ? subString : expression || match;
    result.push(key.trim());
    return "";
  });

  return result;
}
