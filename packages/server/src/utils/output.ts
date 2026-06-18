import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

declare global {
  var _outputDir: string;
}

export function ensureOutput() {
  const outputDirection = join(process.cwd(), '.opensya/server');

  if (!existsSync(outputDirection)) {
    mkdirSync(outputDirection, { recursive: true });
  }

  globalThis._outputDir = outputDirection;

  if (!existsSync(join(_outputDir, 'types')))
    mkdirSync(join(_outputDir, 'types'));
}
