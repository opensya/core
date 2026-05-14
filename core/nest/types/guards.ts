import { OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';
import { ControllerOptions2 } from './controllers';
import { Request } from 'express';

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
