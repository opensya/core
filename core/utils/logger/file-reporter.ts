import { mkdirSync, createWriteStream, WriteStream } from 'fs-extra';
import { dirname } from 'node:path';
import { ConsolaReporter, LogObject } from 'consola';

export class LogFileReporter implements ConsolaReporter {
  private readonly stream: WriteStream;

  constructor(private readonly filePath: string) {
    mkdirSync(dirname(filePath), { recursive: true });

    this.stream = createWriteStream(filePath, {
      flags: 'a',
      encoding: 'utf8',
    });
  }

  log(logObj: LogObject) {
    const date = new Date().toISOString();

    const tags = Array.isArray(logObj.tag) ? logObj.tag : [logObj.tag];

    const prefix = tags
      .filter(Boolean)
      .map((tag) => `[${tag}]`)
      .join('');

    const args = [...logObj.args];

    if (args.length >= 2 && args.at(-1) === '\n') {
      args.pop();
    }

    const message = args.map((arg) => this.serialize(arg)).join(' ');

    const line = `${prefix}[${date}][${logObj.type}] ${message}`;

    this.stream.write(`${line}\n`);

    if (logObj.stack) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.stream.write(`${logObj.stack}\n`);
    }
  }

  private serialize(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof Error) {
      return value.stack || value.message;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
}
