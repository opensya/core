import { getDirs } from '../utils';
import { cpSync } from 'node:fs';
import { join } from 'node:path';

export function copyOutput() {
  const dirs = getDirs();

  cpSync(join(import.meta.dirname, './output'), dirs.OUTPUT_DIR, {
    recursive: true,
    force: true,
  });
}
