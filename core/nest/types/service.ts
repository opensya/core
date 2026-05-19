import { OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';

export type DefineService = <P extends any[], R>(
  handler: (...args: P) => MayBePromise<R>,
) => {
  compiler: (manifest: OpensyaConfigOutput, options: { file: string }) => void;
  handler: (...args: P) => MayBePromise<R>;
};

declare global {
  var defineService: DefineService;
}

export {};
