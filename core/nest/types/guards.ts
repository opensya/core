import type { OpensyaConfigOutput } from '@opensya/config';
import type { MayBePromise } from '@opensya/share';
import type { ControllerOptions2 } from './controllers';
import type { Request } from 'express-serve-static-core';

export type DefineGuard = (
  handler: (params: {
    request: Request;
    controllerOptions: ControllerOptions2;
  }) => MayBePromise<void | {
    pass: boolean;
    errorMessage?: string | string[];
    [key: string]: any;
  }>,
) => {
  compiler: (config: OpensyaConfigOutput, options: { file: string }) => void;
};

declare global {
  var defineGuard: DefineGuard;
}

export {};
