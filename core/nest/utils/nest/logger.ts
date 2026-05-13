import { ConsoleLogger, Injectable } from '@nestjs/common';
import { Logger } from '../logger/logger';
import { colorize } from 'consola/utils';

@Injectable()
export class NestLogger extends ConsoleLogger {
  private readonly logger = new Logger(undefined, 'server');

  override log(message: any, ...optionalParams: any[]) {
    if (optionalParams[0] === 'RouterExplorer') {
      const [route, method] = _.trim(
        message
          .replace(/^Mapped/, '')
          .replace(/ route$/, '')
          .replace(/\{/, '')
          .replace(/\}$/, ''),
      ).split(', ');

      message = [
        colorize('green', '⮞'),
        colorize('red', `[${method}]`.padEnd(8, ' ')),
        colorize('dim', '➜'),
        colorize('greenBright', colorize('underline', route)),
      ].join(' ');
    }

    if (!['RoutesResolver'].includes(optionalParams[0])) {
      this.logger.log(message, ...optionalParams);
    }
  }

  override fatal(message: any, ...optionalParams: any[]) {
    this.logger.fatal(message, ...optionalParams);
  }

  override error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  override warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  override debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  override verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams);
  }
}
