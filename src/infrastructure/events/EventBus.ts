import { injectable } from 'inversify';
import { IEventBus } from '@/core/domain/events/IEventBus';

type EventHandler = (event: any) => void;

@injectable()
export class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  publish<T>(event: T): void {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  subscribe<T>(eventType: string, handler: (event: T) => void): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }
}