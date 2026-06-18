import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

declare global {
  var _outputDir: string;
}

export function ensureOutput() {
  const outputDirection = join(process.cwd(), '.opensya/client');

  if (!existsSync(outputDirection)) {
    mkdirSync(outputDirection, { recursive: true });
  }

  globalThis._outputDir = outputDirection;
}
