import { OpensyaConfigOutput } from '@opensya/config';
import { MayBePromise } from '@opensya/share';

export type RuntimeType =
  | NonNullable<OpensyaConfigOutput['template']>
  | 'kernel';

export type OpensyaConfigOutputForCompilerFn = OpensyaConfigOutput & {
  runtime: RuntimeType;
};

export type CompilerFn = (
  config: OpensyaConfigOutput,
  runtime: RuntimeType,
) => MayBePromise<{
  types?: { name: string; content: string };
  onBootstrap: () => MayBePromise<void>;
} | null>;

export type CompilerFn2 = (params: {
  file: string;
  parent: string;
  config: OpensyaConfigOutputForCompilerFn;
}) => MayBePromise<void>;

export type CompilerSource = {
  parent: string;
  config: OpensyaConfigOutputForCompilerFn;
};

export {};
