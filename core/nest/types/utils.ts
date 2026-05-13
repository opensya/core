import { Logger } from '../utils/logger/logger';

declare module 'lodash' {
  interface LoDashStatic {
    isArrayString(value?: any): boolean;
    sleep(
      /** @default 500 */
      time?: number,
    ): Promise<void>;
  }
}

declare global {
  var __CORE_ROOT_DIR__: string;

  // @ts-ignore
  var _: typeof import('lodash');

  var logger: Logger;
}
