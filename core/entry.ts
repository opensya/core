import { Env, EnvDefinition, InferEnv, LoadEnvOptions } from './utils/env';
import { getDirs, loadConfig, OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';
import { setGlobls } from './utils/set-globals';
import { resolve } from 'node:path';

async function _entry({
  envDefinition,
  envOptions = {},
}: {
  envDefinition?: EnvDefinition;
  envOptions?: LoadEnvOptions;
} = {}) {
  await setGlobls();

  const preEnv = Env.create({
    CORE_ENV: Env.schema.enum(['factory'] as const).optional(),
  });

  let cwd = process.cwd();
  if (preEnv.CORE_ENV === 'factory') cwd = resolve(cwd, 'playground');

  const config = await loadConfig(cwd);
  const dirs = getDirs(config);

  const env = Env.runtime(envDefinition ?? {}, {
    ...envOptions,
    with: ['CORE_ENV', 'NODE_ENV'],
  });

  return { config, env, dirs };
}
export async function entry(
  run: (
    config: OpensyaConfigOutput,
    params: Awaited<ReturnType<typeof _entry>>,
  ) => MayBePromise<void>,
  options: Parameters<typeof _entry>['0'] = {},
) {
  const r = await _entry(options);
  await run(r.config, r);
}

export async function entryAsync(options: Parameters<typeof _entry>['0'] = {}) {
  return await _entry(options);
}
