import { atomicWriteFile } from '@core/utils';
import { join, resolve } from 'node:path';
import { generateCode, loadFile } from 'magicast';
import { OUTPUT_DIR } from './output';

export async function setCoreDir() {
  const mod = await loadFile(join(OUTPUT_DIR, 'meta.js'));

  mod.exports.CORE_DIR = join(import.meta.dirname, '..');
  const { code } = generateCode(mod);

  atomicWriteFile(resolve(OUTPUT_DIR, 'meta.js'), code);
}
