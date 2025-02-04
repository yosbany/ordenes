import { ICache } from '@/core/domain/cache/ICache';

export class CompositeCache implements ICache {
  constructor(private caches: ICache[]) {}

  async get<T>(key: string): Promise<T | null> {
    for (const cache of this.caches) {
      const value = await cache.get<T>(key);
      if (value !== null) {
        // Propagate to previous caches
        for (const prevCache of this.caches) {
          if (prevCache === cache) break;
          await prevCache.set(key, value);
        }
        return value;
      }
    }
    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await Promise.all(
      this.caches.map(cache => cache.set(key, value, ttl))
    );
  }

  async delete(key: string): Promise<void> {
    await Promise.all(
      this.caches.map(cache => cache.delete(key))
    );
  }

  async clear(): Promise<void> {
    await Promise.all(
      this.caches.map(cache => cache.clear())
    );
  }

  async has(key: string): Promise<boolean> {
    for (const cache of this.caches) {
      if (await cache.has(key)) {
        return true;
      }
    }
    return false;
  }
}