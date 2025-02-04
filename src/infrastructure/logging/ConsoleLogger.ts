import { ILogger } from '@/core/domain/logging/ILogger';

export class ConsoleLogger implements ILogger {
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => 
      arg instanceof Error 
        ? `${arg.name}: ${arg.message}\n${arg.stack}` 
        : JSON.stringify(arg)
    ).join(' ');
    
    return `[${timestamp}] [${level}] ${message} ${formattedArgs}`.trim();
  }

  debug(message: string, ...args: any[]): void {
    if (import.meta.env.DEV) {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    console.info(this.formatMessage('INFO', message, ...args));
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message, ...args));
  }

  error(message: string, error?: Error, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message, error, ...args));
  }
}