import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const OUTPUT_DIR = join(process.cwd(), '.opensya');
export const OUTPUT_DIR_SERVER = join(OUTPUT_DIR, 'server');
export const OUTPUT_DIR_CLIENT = join(OUTPUT_DIR, 'client');

export function ensureOutput() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR_SERVER, { recursive: true });
  mkdirSync(OUTPUT_DIR_CLIENT, { recursive: true });
}
