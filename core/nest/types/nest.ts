import { ModuleMetadata, NestApplicationOptions, Type } from '@nestjs/common';
import { MayBePromise } from '@opensya/share';

export type NestConfig = {
  modules: Omit<Required<ModuleMetadata>, 'controllers'>;

  controllers: Record<string, Type<any>>;

  i18nLocaleDirs: string[];

  options: Omit<NestApplicationOptions, 'logger' | 'bufferLogs'>;
  onBootstraps: Array<() => MayBePromise<void>>;
};

declare global {
  var _nestConfig: NestConfig;
  var _mainDir: string;
}

export {};
