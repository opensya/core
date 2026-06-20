import { join } from 'node:path';
import { CORE_DIR } from './meta.js';

const { bootstrap } = await import(join(CORE_DIR, 'bootstrap'));
bootstrap();
