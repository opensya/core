import { ModuleMetadata, NestApplicationOptions } from '@nestjs/common';

export type ServerConfig = Omit<ModuleMetadata, 'controllers'> & {
  onBootstrap?: () => any;
  options?: NestApplicationOptions;
  paths?: Record<string, string[]>;
};

declare module '@opensya/config' {
  interface OpensyaConfig {
    /** @default 'server' */ serverDir?: string;

    ['server']?: boolean | ServerConfig;
  }

  interface OpensyaConfigOutput {
    ['server']: ServerConfig;
  }
}

export {};
