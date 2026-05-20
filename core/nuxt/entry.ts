import { MayBePromise } from '@opensya/share';
import { entryAsync } from '../entry';
import { envDefinition } from './utils/env';
// import { setGlobals } from './utils/set-globals';

export async function nuxtEntry(
  cb?: (param: Awaited<ReturnType<typeof entryAsync>>) => MayBePromise<void>,
) {
  const r = await entryAsync({
    envDefinition,
    envOptions: { prefix: 'NUXT_' },
  });

  globalThis._nuxtEnv = r.env as any;
  globalThis._config = r.config;

  void cb?.(r);

  return r;
}
