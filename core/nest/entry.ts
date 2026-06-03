import { MayBePromise } from '@opensya/share';
import { entry, entryAsync } from '#core/entry';
import { envDefinition } from './utils/env';
import { setGlobals } from './utils/set-globals';

/** @deprecated */
export function nestEntry0(cb: () => MayBePromise<void>) {
  void entry(
    async (config, { env }) => {
      await setGlobals();

      globalThis._env = env as any;
      globalThis._config = config;

      void cb();
    },
    {
      envDefinition,
      envOptions: { prefix: 'NEST_' },
    },
  );
}

export async function nestEntry(
  cb?: (param: Awaited<ReturnType<typeof entryAsync>>) => MayBePromise<void>,
) {
  const r = await entryAsync({
    envDefinition,
    envOptions: { prefix: 'NEST_' },
  });

  await setGlobals();

  globalThis._env = r.env as any;
  globalThis._config = r.config;

  void cb?.(r);

  return r;
}
