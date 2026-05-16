import { Logger } from '@core/utils/logger/logger';
import { define } from '../define';

export async function setGlobals() {
  await define();
  globalThis._types = { models: {} };
  globalThis.logger = new Logger();
}
