import { InferEnv } from '#core/utils/env';
import { envDefinition } from '../utils/env';

declare global {
  var _nuxtEnv: InferEnv<typeof envDefinition>;
}
