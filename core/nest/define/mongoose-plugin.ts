import { plugin } from 'mongoose';

globalThis.defineMongoosePlugin = function (schema, options) {
  return {
    compiler() {
      plugin(schema, options);
    },
  };
};
