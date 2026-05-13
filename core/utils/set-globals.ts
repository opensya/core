import { defineOpensyaConfig } from '@opensya/config';
import * as zod from 'zod';
import lodash from 'lodash';

globalThis.z = zod;

extendLodash();
function extendLodash() {
  function isArrayString(value: string) {
    try {
      const array = JSON.parse(value) as any[];
      return Array.isArray(array);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }

  async function sleep(time = 500) {
    await new Promise((resolve) => setTimeout(resolve, time));
  }

  globalThis._ = lodash;
  _.isArrayString = isArrayString;
  _.sleep = sleep;
}

globalThis.defineOpensyaConfig = defineOpensyaConfig;
