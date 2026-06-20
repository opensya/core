import path from 'node:path';

export function resolveServiceFromFilePath(filePath: string): {
  name: string;
} {
  const normalized = filePath.replaceAll('\\', '/');
  const extension = path.extname(normalized);

  const segments = normalized
    .slice(0, -extension.length)
    .split('/')
    .filter((segment) => segment !== 'index');

  return {
    name: segments.join('.'),
  };
}
