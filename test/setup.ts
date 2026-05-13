import 'reflect-metadata';
import { vi } from 'vitest';

vi.stubGlobal('_config', {});
vi.stubGlobal('_env', {});
vi.stubGlobal('_nestConfig', {});
vi.stubGlobal('_nestApp', null);
