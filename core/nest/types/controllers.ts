import { RequestMethod } from '@nestjs/common';
import type {
  NextFunction,
  Request,
  Response,
} from 'express-serve-static-core';
import { MayBePromise } from '@opensya/share';
import { OpensyaConfigOutput } from '@opensya/config';

export type HttpMethod = Exclude<keyof typeof RequestMethod, symbol>;

export type ControllerContext = {
  req: Request;
  res: Response;
  next: NextFunction;
};

export type AccessOptions =
  | true
  | {
      jobID?: string | ((request: Request) => MayBePromise<string>);
      roles?: string[]; // TODO JobUser['role'][];
    };

export type DisallowSelfActionOptions =
  | true
  | string
  | ((req: Request) => MayBePromise<string>);

type preOptions =
  | { public: true; access?: never; roles?: never; disallowSelfAction?: never }
  | {
      public?: false;
      access?: AccessOptions;
      roles?: string[]; // User['role'][];
      disallowSelfAction?: DisallowSelfActionOptions;
    };

export type ControllerOptions = {
  name?: string;
  path?: string | string[];
  method?: HttpMethod | Lowercase<HttpMethod>;
} & preOptions;

export interface ControllerOptions2 {
  idx: string;
  name: string;
  path: string | string[];
  method: HttpMethod | Lowercase<HttpMethod>;
}

export type ControllerDefineParams<T> = {
  handler: (ctx: ControllerContext) => MayBePromise<T>;
  options?: ControllerOptions;
};

export type ControllerHandler = (ctx: ControllerContext) => MayBePromise<any>;

export type DefineController = <R>(
  handler: (context: ControllerContext) => MayBePromise<R>,
  options?: ControllerOptions,
) => {
  compiler: (config: OpensyaConfigOutput, options: { file: string }) => void;
};

declare global {
  var defineController: DefineController;
}

export {};
