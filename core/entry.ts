import { Env, EnvDefinition, InferEnv, LoadEnvOptions } from '@core/utils/env';
import { getDirs, loadConfig, OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';
import { setGlobls } from './utils/set-globals';
import { resolve } from 'node:path';

export async function entry<E extends EnvDefinition>(
  run: (
    config: OpensyaConfigOutput,
    params: {
      env: InferEnv<E>;
      dirs: ReturnType<typeof getDirs>;
    },
  ) => MayBePromise<void>,
  {
    envDefinition,
    envOptions = {},
  }: {
    envDefinition?: E;
    envOptions?: LoadEnvOptions;
  } = {},
) {
  await setGlobls();

  const preEnv = Env.create({
    CORE_ENV: Env.schema.enum(['factory'] as const).optional(),
  });

  let cwd = process.cwd();
  if (preEnv.CORE_ENV === 'factory') cwd = resolve(cwd, 'playground');

  const config = await loadConfig(cwd);
  const dirs = getDirs(config);

  const env = Env.runtime<E>(envDefinition ?? ({} as E), {
    ...envOptions,
    with: ['CORE_ENV', 'NODE_ENV'],
  });

  await run(config, { env, dirs });
}
