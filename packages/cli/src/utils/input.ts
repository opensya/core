import { join } from 'node:path';

export const INPUT_DIR = join(process.cwd(), 'playground');
export const INPUT_DIR_SERVER = join(INPUT_DIR, 'server');
export const INPUT_DIR_CLIENT = join(INPUT_DIR, 'client');
