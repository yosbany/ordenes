import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { ILogger } from '@/core/domain/logging/ILogger';

export class FirebaseLogger implements ILogger {
  private readonly COLLECTION = 'logs';

  private async logToFirebase(level: string, message: string, ...args: any[]) {
    try {
      const logsRef = ref(db, this.COLLECTION);
      await push(logsRef, {
        timestamp: Date.now(),
        level,
        message,
        args: args.map(arg => 
          arg instanceof Error 
            ? { name: arg.name, message: arg.message, stack: arg.stack }
            : arg
        )
      });
    } catch (error) {
      console.error('Failed to write log to Firebase:', error);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (import.meta.env.DEV) {
      this.logToFirebase('DEBUG', message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    this.logToFirebase('INFO', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logToFirebase('WARN', message, ...args);
  }

  error(message: string, error?: Error, ...args: any[]): void {
    this.logToFirebase('ERROR', message, error, ...args);
  }
}