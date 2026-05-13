import { plugin } from 'mongoose';
import { OpensyaConfigOutput } from '@opensya/config';

export type DefineMongoosePlugin = (...params: Parameters<typeof plugin>) => {
  compiler: (config: OpensyaConfigOutput) => void;
};

declare global {
  var defineMongoosePlugin: DefineMongoosePlugin;
}
