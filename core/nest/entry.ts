import { Env, InferEnv } from '@core/utils/env';
import { getDirs_v4, loadConfig, OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';
import { envDefinition } from './utils/env.js';

export async function nestEntry(
  run: (
    config: OpensyaConfigOutput,
    params: {
      env: InferEnv<typeof envDefinition>;
      dirs: ReturnType<typeof getDirs_v4>;
    },
  ) => MayBePromise<void>,
  { processEnv = true, cwd }: { processEnv?: boolean; cwd?: string } = {},
) {
  const env = Env.runtime(envDefinition, {
    prefix: 'NEST_',
    with: ['CORE_ENV'],
    processEnv,
  });

  await import('./utils/set-globals.js');
  const config = await loadConfig(cwd);
  const dirs = getDirs_v4(config);

  if (processEnv) {
    globalThis._config = config;
    globalThis._env = env;
  }

  await run(config, { env, dirs });
}
