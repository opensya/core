import { atomicWriteFile } from '@core/utils';
import { join, resolve } from 'node:path';
import { generateCode, loadFile } from 'magicast';
import { getDirs } from './dirs';

export async function setCoreDir() {
  const dirs = getDirs();

  const mod = await loadFile(join(dirs.OUTPUT_DIR, 'meta.js'));

  mod.exports.CORE_DIR = join(import.meta.dirname, '..');
  const { code } = generateCode(mod);

  atomicWriteFile(resolve(dirs.OUTPUT_DIR, 'meta.js'), code);
}
