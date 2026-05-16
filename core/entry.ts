import { Env, EnvDefinition, InferEnv, LoadEnvOptions } from '@core/utils/env';
import { getDirs, loadConfig, OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';
import { defineOpensyaConfig } from '@opensya/config';

export async function entry<E extends EnvDefinition>(
  run: (
    config: OpensyaConfigOutput,
    params: {
      env: InferEnv<E>;
      dirs: ReturnType<typeof getDirs>;
    },
  ) => MayBePromise<void>,
  {
    cwd,

    envDefinition,
    envOptions = {},
  }: {
    cwd?: string;

    envDefinition?: E;
    envOptions?: LoadEnvOptions;
  } = {},
) {
  await import('@opensya/share/set-globals');

  globalThis.defineOpensyaConfig = defineOpensyaConfig;

  const config = await loadConfig(cwd);
  const dirs = getDirs(config);

  const env = Env.runtime<E>(envDefinition ?? ({} as E), {
    ...envOptions,
    with: ['CORE_ENV', 'NODE_ENV'],

    // processEnv,
    path: config.envFile,
  });

  // if (processEnv) {
  //   globalThis._config = config;
  //   globalThis._env = env;
  // }

  await run(config, { env, dirs });
}
