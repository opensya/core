import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { OUTPUT_DIR } from './output';

export function copyOutput() {
  cpSync(join(import.meta.dirname, '../output'), OUTPUT_DIR, {
    recursive: true,
    force: true,
  });
}
