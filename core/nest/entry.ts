import { MayBePromise } from '@opensya/share';
import { entry } from '@core/entry';
import { envDefinition } from './utils/env';
import { setGlobals } from './utils/set-globals';

export function nestEntry(cb: () => MayBePromise<void>) {
  void entry(
    async (config, { env }) => {
      await setGlobals();

      globalThis._env = env;
      globalThis._config = config;

      void cb();
    },
    {
      envDefinition,
      envOptions: { prefix: 'NEST_' },
    },
  );
}
