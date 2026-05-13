import { OpensyaConfigOutput } from '@opensya/config';
import * as plugins from './plugins';

export async function compiler(config: OpensyaConfigOutput) {
  await plugins.compiler(config);
}
