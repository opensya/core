import { vi } from 'vitest';

vi.stubGlobal('_config', {});
vi.stubGlobal('_env', {});
vi.stubGlobal('_nestConfig', {
  controllers: [],
  services: [],
  models: [],
  guards: [],
});
vi.stubGlobal('_nestApp', null);
