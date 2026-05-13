import { defineOpensyaConfig } from '@opensya/config';
import * as zod from 'zod';
import lodash from 'lodash';
import { Logger } from './logger/logger';

globalThis.z = zod;

globalThis._ = lodash;
_.isArrayString = isArrayString;
_.sleep = sleep;

globalThis.defineOpensyaConfig = defineOpensyaConfig;

globalThis._types = { models: {} };

globalThis.logger = new Logger();

function isArrayString(value: string) {
  try {
    const array = JSON.parse(value) as any[];
    return Array.isArray(array);
  } catch {
    return false;
  }
}

async function sleep(time = 500) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

import '../define';
