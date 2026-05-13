import { ConsolaInstance, createConsola } from 'consola';
import { LogFileReporter } from './file-reporter';
import { resolve } from 'node:path';
import { LogReporter } from './log-reporter';

type OpensyaLogLevel =
  | 'info'
  | 'warn'
  | 'debug'
  | 'trace'
  | 'fatal'
  | 'error'
  | 'start'
  | 'success'
  | 'fail'
  | 'ready';

export class Logger {
  private readonly consola: ConsolaInstance;

  constructor(
    private readonly context?: string,
    private readonly prefix = 'server',
  ) {
    this.consola = createConsola({
      level: 5,
      reporters: [
        new LogReporter(),
        new LogFileReporter(resolve(process.cwd(), 'logs/server.log')),
      ],
    });
  }

  log(message?: any, ...optionalParams: any[]) {
    this.write('info', message, optionalParams);
  }

  fatal(message?: any, ...optionalParams: any[]) {
    this.write('fatal', message, optionalParams);
  }

  error(message?: any, ...optionalParams: any[]) {
    const { context, stack, metadata } =
      this.extractErrorParams(optionalParams);

    this.consola.error({
      message,
      additional: metadata,
      stack,
      tag: this.getTag(context || this.context),
    });
  }

  warn(message?: any, ...optionalParams: any[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message?: any, ...optionalParams: any[]) {
    this.write('trace', message, optionalParams);
  }

  start(message?: any, ...optionalParams: any[]) {
    this.write('start', message, optionalParams);
  }

  success(message?: any, ...optionalParams: any[]) {
    this.write('success', message, optionalParams);
  }

  fail(message?: any, ...optionalParams: any[]) {
    this.write('fail', message, optionalParams);
  }

  ready(message?: any, ...optionalParams: any[]) {
    this.write('ready', message, optionalParams);
  }

  private write(
    level: Exclude<OpensyaLogLevel, 'error'>,
    message: any,
    optionalParams: any[],
  ) {
    const { context, metadata } = this.extractParams(optionalParams);

    if (message === '' || message === undefined) message = ' ';

    this.consola[level]({
      message,
      additional: metadata,
      tag: this.getTag(context || this.context),
    });
  }

  private getTag(context?: string) {
    const tag = context ? [this.prefix, context] : [this.prefix];
    return JSON.stringify(tag);
  }

  private extractParams(optionalParams: any[]) {
    let context: string | undefined;
    const metadata = [...optionalParams];

    if (typeof metadata[metadata.length - 1] === 'string') {
      context = metadata.pop();
    }

    return { context, metadata };
  }

  private extractErrorParams(optionalParams: any[]) {
    let stack: string | undefined;
    let context: string | undefined;

    const metadata = [...optionalParams];

    if (typeof metadata[0] === 'string' && metadata[0].includes('\n')) {
      stack = metadata.shift();
    }

    if (typeof metadata[metadata.length - 1] === 'string') {
      context = metadata.pop();
    }

    return { stack, context, metadata };
  }
}
