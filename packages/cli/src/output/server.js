/* eslint-disable @typescript-eslint/no-unsafe-call */

import { join } from 'node:path';
import { CORE_DIR } from './meta';

const { bootstrap } = await import(join(CORE_DIR, 'bootstrap'));
bootstrap();
