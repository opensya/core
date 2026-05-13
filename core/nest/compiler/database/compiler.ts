import { OpensyaConfigOutput } from '@opensya/config';
import * as plugins from './plugins';
import * as models from './models';

export async function compiler(config: OpensyaConfigOutput) {
  await plugins.compiler(config);
  await models.compiler(config);
}
