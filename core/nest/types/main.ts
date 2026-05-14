import {
  INestApplication,
  ModuleMetadata,
  NestApplicationOptions,
} from '@nestjs/common';
import { ControllerOptions } from './controllers';
import { InferEnv } from '@core/utils/env';
import { envDefinition } from '../utils/env';

export type ServerConfig = Omit<ModuleMetadata, 'controllers'> & {
  onBootstrap?: () => any;
  options?: NestApplicationOptions;
  paths?: Record<string, string[]>;
};

declare global {
  var _env: InferEnv<typeof envDefinition>;

  var BASE_URL: string;
  var API_BASE_URL: string;
  var ALL_CONTROLLERS: Record<string, Required<ControllerOptions>>;

  var _types: Record<'models', Record<string, string>>;
  var _nestApp: INestApplication;

  function useService(name: string): (...args: any[]) => Promise<any>;
  function getModel<T = unknown>(name: string): import('mongoose').Model<T>;
}

declare module '@opensya/config' {
  interface OpensyaConfig {
    /** @default 'server' */ serverDir?: string;

    ['server']?: boolean | ServerConfig;
  }

  interface OpensyaConfigOutput {
    ['server']: ServerConfig;
  }
}
