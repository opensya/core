import { existsSync, readFileSync } from 'node:fs';

export function readJson<T>(filePath: string, fallback: T): T {
  return existsSync(filePath)
    ? JSON.parse(readFileSync(filePath, 'utf8'))
    : fallback;
}
