import consola, { ConsolaReporter, LogObject } from 'consola';
import { colorize } from 'consola/utils';

export class LogReporter implements ConsolaReporter {
  log(logObj: LogObject) {
    // const date = new Date().toISOString();

    const tags = Array.isArray(logObj.tag)
      ? logObj.tag
      : _.isArrayString(logObj.tag)
        ? (JSON.parse(logObj.tag) as string[])
        : [logObj.tag];

    const prefix = tags
      // .filter(Boolean)
      .map((tag) => colorize('dim', `[${tag}]`))
      .join('');

    if (logObj.args.at(-1) === '\n') logObj.args.splice(-1, 1);

    consola[logObj.type](prefix, logObj.args[0], ...logObj.args.slice(1));

    if (logObj.stack) {
      console.error(logObj.stack);
    }
  }
}
