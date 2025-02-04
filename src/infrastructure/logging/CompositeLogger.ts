import { ILogger } from '@/core/domain/logging/ILogger';

export class CompositeLogger implements ILogger {
  constructor(private loggers: ILogger[]) {}

  debug(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.debug(message, ...args));
  }

  info(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.info(message, ...args));
  }

  warn(message: string, ...args: any[]): void {
    this.loggers.forEach(logger => logger.warn(message, ...args));
  }

  error(message: string, error?: Error, ...args: any[]): void {
    this.loggers.forEach(logger => logger.error(message, error, ...args));
  }
}