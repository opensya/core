import { OpensyaConfigOutput } from '@opensya/config';

export function setNestConfig(config: OpensyaConfigOutput) {
  globalThis._nestConfig ??= {
    modules: {
      imports: [],
      providers: [],
      exports: [],
    },
    controllers: {},
    onBootstraps: [],
    options: {},
    i18nLocaleDirs: [],
  };

  const _nest = globalThis._nestConfig;

  if (typeof config.server === 'boolean') return;
  if (typeof config.server === 'undefined') return;

  if (config.server.onBootstrap) {
    _nest.onBootstraps.push(config.server.onBootstrap);
  }

  _nest.options = _.merge(_nest.options, config.server.options ?? {});
  _nest.modules.imports.push(...(config.server.imports ?? []));
  _nest.modules.providers.push(...(config.server.providers ?? []));
  _nest.modules.exports.push(...(config.server.exports ?? []));

  globalThis._nestConfig = _nest;

  return _nest;
}
