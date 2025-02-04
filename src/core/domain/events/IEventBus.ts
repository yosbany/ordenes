export interface IEventBus {
  publish<T>(event: T): void;
  subscribe<T>(eventType: string, handler: (event: T) => void): () => void;
}